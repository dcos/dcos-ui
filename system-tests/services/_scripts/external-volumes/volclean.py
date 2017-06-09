#!/usr/bin/env python3
#
# AWS Volume Cleaner
# Written by: Lukas Losche
# Source: https://github.com/lloesche/awsvolclean
#
# TO-DO:
# Ideally, we do not want to copy and paste the script to here from the source.
# Instead, we should import a module with the functionality.
# Will need to speak to Lukas on building the functionality as an API.
#

import boto3
import boto3.session
import botocore.exceptions
from datetime import datetime, timedelta
import sys
import re
import argparse
import logging
from multiprocessing.pool import ThreadPool
from pprint import pprint
from retrying import retry

logging.basicConfig(level=logging.WARN, format='%(asctime)s - %(levelname)s - %(message)s')
logging.getLogger('__main__').setLevel(logging.INFO)
logging.getLogger('VolumeCleaner').setLevel(logging.INFO)
log = logging.getLogger(__name__)


def main(argv):
    p = argparse.ArgumentParser(description='Remove unused EBS volumes')
    p.add_argument('--access-key-id', '-k', help='AWS Access Key ID', dest='access_key_id')
    p.add_argument('--secret-access-key', '-s', help='AWS Secret Access Key', dest='secret_access_key')
    p.add_argument('--region', '-r', help='AWS Region (default: all)', dest='region', type=str, default=None,
                   nargs='+')
    p.add_argument('--run-dont-ask', '-y', help='Assume YES to all questions', action='store_true', default=False,
                   dest='all_yes')
    p.add_argument('--pool-size', '-p',
                   help='Thread Pool Size - how many AWS API requests we do in parallel (default: 10)',
                   dest='pool_size', default=10, type=int)
    p.add_argument('--age', '-a', help='Days after which a Volume is considered orphaned (default: 14)', dest='age',
                   default=14, type=check_positive)
    p.add_argument('--tags', '-t', help='Tag filter in format "key:regex" (E.g. Name:^integration-test)',
                   dest='tags', type=str, default=None, nargs='+')
    p.add_argument('--ignore-metrics', '-i', help='Ignore Volume Metrics - remove all detached Volumes',
                   dest='ignore_metrics', action='store_true', default=False)
    p.add_argument('--verbose', '-v', help='Verbose logging', dest='verbose', action='store_true', default=False)
    args = p.parse_args(argv)

    if args.verbose:
        logging.getLogger('__main__').setLevel(logging.DEBUG)
        logging.getLogger('VolumeCleaner').setLevel(logging.DEBUG)

    if not args.region:
        log.info('Region not specified, assuming all regions')
        regions = all_regions(args)
    else:
        regions = args.region

    for region in regions:
        vol_clean = VolumeCleaner(args, region=region)
        vol_clean.run()


def check_positive(value):
    ivalue = int(value)
    if ivalue <= 0:
        raise(argparse.ArgumentTypeError("%s is an invalid positive int value" % value))
    return ivalue


def all_regions(args):
    session = boto3.session.Session(aws_access_key_id=args.access_key_id,
                                    aws_secret_access_key=args.secret_access_key)
    ec2 = session.client('ec2', region_name='us-west-2')
    regions = ec2.describe_regions()
    return [r['RegionName'] for r in regions['Regions']]


def retry_on_request_limit_exceeded(e):
    if isinstance(e, botocore.exceptions.ClientError):
        if e.response['Error']['Code'] == 'RequestLimitExceeded':
            log.debug('AWS API request limit exceeded, retrying with exponential backoff')
            return True
    return False


class VolumeCleaner:
    def __init__(self, args, region):
        self.args = args
        self.log = logging.getLogger(__name__)
        self.region = region

    @retry(stop_max_attempt_number=30, wait_exponential_multiplier=3000, wait_exponential_max=120000,
           retry_on_exception=retry_on_request_limit_exceeded)
    def run(self):
        p = ThreadPool(self.args.pool_size)
        candidates = list(filter(None, p.map(self.candidate, self.available_volumes())))
        if len(candidates) > 0 and (self.args.all_yes or query_yes_no(
                'Do you want to remove {} Volumes in Region {}?'.format(len(candidates), self.region))):
            self.log.info('Removing {} Volumes in Region {}'.format(len(candidates), self.region))
            p.map(self.remove_volume, candidates)
            self.log.info('Done')
        else:
            self.log.info('Not doing anything in Region {}'.format(self.region))

    def available_volumes(self):
        self.log.debug('Finding unused Volumes in Region {}'.format(self.region))
        session = boto3.session.Session(aws_access_key_id=self.args.access_key_id,
                                        aws_secret_access_key=self.args.secret_access_key,
                                        region_name=self.region)
        ec2 = session.resource('ec2')
        volumes = ec2.volumes.filter(Filters=[{'Name': 'status', 'Values': ['available']}])
        self.log.debug('Found {} unused Volumes in Region {}'.format(len(list(volumes)), self.region))
        return volumes

    # based on http://blog.ranman.org/cleaning-up-aws-with-boto3/
    def get_metrics(self, volume):
        self.log.debug('Retrieving Metrics for Volume {}'.format(volume.volume_id))
        session = boto3.session.Session(aws_access_key_id=self.args.access_key_id,
                                        aws_secret_access_key=self.args.secret_access_key,
                                        region_name=self.region)
        cw = session.client('cloudwatch')

        end_time = datetime.now() + timedelta(days=1)
        start_time = end_time - timedelta(days=self.args.age)

        return cw.get_metric_statistics(
            Namespace='AWS/EBS',
            MetricName='VolumeIdleTime',
            Dimensions=[{'Name': 'VolumeId', 'Value': volume.volume_id}],
            Period=3600,
            StartTime=start_time,
            EndTime=end_time,
            Statistics=['Minimum'],
            Unit='Seconds'
        )

    def tag_filter(self, volume):
        if not self.args.tags:
            return True

        if volume.tags is None:
            return False

        for tag in self.args.tags:
            search_key, search_value = tag.split(':', 1)
            if not search_key or not search_value:
                raise ValueError('Malformed tag search: {}'.format(tag))

            tag_value = next((item['Value'] for item in volume.tags if item['Key'] == search_key), None)
            if tag_value is None:
                self.log.debug('Volume {} has no tag {}'.format(volume.volume_id, search_key))
                return False

            regex = re.compile(search_value)
            if not regex.search(tag_value):
                self.log.debug(
                    "Volume {} with tag {}={} doesn't match regex {}".format(volume.volume_id, search_key, tag_value,
                                                                             search_value))
                return False

        return True

    def candidate(self, volume):
        if not self.tag_filter(volume):
            self.log.debug('Volume {} is no candidate for deletion'.format(volume.volume_id))
            return None

        if self.args.ignore_metrics:
            self.log.debug('Volume {} is a candidate for deletion'.format(volume.volume_id))
            return volume

        metrics = self.get_metrics(volume)
        for metric in metrics['Datapoints']:
            if metric['Minimum'] < 299:
                self.log.debug('Volume {} is no candidate for deletion'.format(volume.volume_id))
                return None

        self.log.debug('Volume {} is a candidate for deletion'.format(volume.volume_id))
        return volume

    @retry(stop_max_attempt_number=100, wait_exponential_multiplier=1000, wait_exponential_max=30000,
           retry_on_exception=retry_on_request_limit_exceeded)
    def remove_volume(self, volume, thread_safe=True):
        self.log.debug('Removing Volume {}'.format(volume.volume_id))
        if thread_safe:
            session = boto3.session.Session(aws_access_key_id=self.args.access_key_id,
                                            aws_secret_access_key=self.args.secret_access_key,
                                            region_name=self.region)
            ec2 = session.resource('ec2')
            volume = ec2.Volume(volume.volume_id)

        volume.delete()


# From http://stackoverflow.com/questions/3041986/apt-command-line-interface-like-yes-no-input
def query_yes_no(question, default='no'):
    valid = {"yes": True, "y": True, "ye": True,
             "no": False, "n": False}
    if default is None:
        prompt = " [y/n] "
    elif default == "yes":
        prompt = " [Y/n] "
    elif default == "no":
        prompt = " [y/N] "
    else:
        raise ValueError("invalid default answer: '%s'" % default)

    while True:
        sys.stdout.write(question + prompt)
        choice = input().lower()
        if default is not None and choice == '':
            return valid[default]
        elif choice in valid:
            return valid[choice]
        else:
            sys.stdout.write("Please respond with 'yes' or 'no' "
                             "(or 'y' or 'n').\n")


if __name__ == "__main__":
    main(sys.argv[1:])
