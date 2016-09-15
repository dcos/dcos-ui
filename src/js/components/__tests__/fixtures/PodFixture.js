module.exports = {
  'spec': {
    'id': '/podABCD',
    'version': '2016-08-29T01:01:01.001',
    'containers': [
      {
        'name': 'container-1',
        'image': { 'kind': 'DOCKER', 'id': 'jdef/my-web-service-abc:v1.1.1' },
        'endpoints': [
          {
            'name': 'nginx',
            'containerPort': 8888,
            'hostPort': 0,
            'protocol': 'http',
            'labels': [
              { 'VIP0': '1.2.3.4:80' }
            ]
          }
        ],
        'resources': { 'cpus': 0.5, 'mem': 64 }
      },
      {
        'name': 'container-2',
        'image': { 'kind': 'DOCKER', 'id': 'jdef/my-web-service-abc:v1.1.1' },
        'endpoints': [
          {
            'name': 'nginx',
            'containerPort': 8888,
            'hostPort': 0,
            'protocol': 'http',
            'labels': [
              { 'VIP0': '1.2.3.4:80' }
            ]
          }
        ],
        'resources': { 'cpus': 0.5, 'mem': 64 }
      }
    ],
    'scaling': {
      'fixed': {
        'instances': 10
      }
    },
    'scheduling': {
      'placement': {
        'constraints': [
          { 'fieldName': 'hostname', 'operator': 'UNIQUE' }
        ],
        'acceptedResourceRoles': ['slave_public']
      }
    }
  },
  'status': 'STABLE',
  'statusSince': '2016-08-31T01:01:01.001',
  'message': 'All pod instances are running and in good health',
  'lastUpdated': '2016-08-31T01:01:01.001',
  'lastChanged': '2016-08-31T01:01:01.001',
  'instances': [
    {
      'id': 'instance-1',
      'status': 'STABLE',
      'statusSince': '2016-08-31T01:01:01.001',
      'agent': 'agent-1',
      'resources': { 'cpus': 1.0, 'mem': 128 },
      'lastUpdated': '2016-08-31T01:01:01.001',
      'lastChanged': '2016-08-31T01:01:01.001',
      'containers': [
        {
          'name': 'container-1',
          'status': 'RUNNING',
          'statusSince': '2016-08-31T01:01:01.001',
          'containerId': 'container-id-1',
          'endpoints': [
            { 'name': 'nginx', 'allocatedHostPort': 31001 }
          ],
          'lastUpdated': '2016-08-31T01:01:01.001',
          'lastChanged': '2016-08-31T01:01:01.001'
        },
        {
          'name': 'container-2',
          'status': 'RUNNING',
          'statusSince': '2016-08-31T01:01:01.001',
          'containerId': 'container-id-1',
          'endpoints': [
            { 'name': 'nginx', 'allocatedHostPort': 31002 }
          ],
          'lastUpdated': '2016-08-31T01:01:01.001',
          'lastChanged': '2016-08-31T01:01:01.001'
        }
      ]
    }
  ]
};
