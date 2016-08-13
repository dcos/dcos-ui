jest.dontMock('../CollapsingString');
jest.dontMock('../PageHeader');
jest.dontMock('../ServiceInfo');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
var ReactDOM = require('react-dom');

var Framework = require('../../structs/Framework');
var Service = require('../../structs/Service');
var ServiceInfo = require('../ServiceInfo');

describe('ServiceInfo', function () {

  const service = new Service({
    id: '/group/test',
    healthChecks: [{path: '', protocol: 'HTTP'}],
    cpus: 1,
    deployments: [],
    mem: 2048,
    disk: 0,
    tasksStaged: 0,
    tasksRunning: 2,
    tasksHealthy: 2,
    tasksUnhealthy: 0,
    images: {
      'icon-large': 'foo.png'
    }
  });

  const framework = new Framework({
    id: '/chronos',
    cpus: 1,
    labels: {
      'DCOS_PACKAGE_METADATA': 'eyJsaWNlbnNlcyI6W3sibmFtZSI6IkFwYWNoZSBMaWNlbnNlIFZlcnNpb24gMi4wIiwidXJsIjoiaHR0cHM6Ly9naXRodWIuY29tL21lc29zL2Nocm9ub3MvYmxvYi9tYXN0ZXIvTElDRU5TRSJ9XSwibmFtZSI6ImNocm9ub3MiLCJwb3N0SW5zdGFsbE5vdGVzIjoiQ2hyb25vcyBEQ09TIFNlcnZpY2UgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGluc3RhbGxlZCFcblxuXHREb2N1bWVudGF0aW9uOiBodHRwOi8vbWVzb3MuZ2l0aHViLmlvL2Nocm9ub3Ncblx0SXNzdWVzOiBodHRwczovL2dpdGh1Yi5jb20vbWVzb3MvY2hyb25vcy9pc3N1ZXMiLCJzY20iOiJodHRwczovL2dpdGh1Yi5jb20vbWVzb3MvY2hyb25vcy5naXQiLCJkZXNjcmlwdGlvbiI6IkEgZmF1bHQgdG9sZXJhbnQgam9iIHNjaGVkdWxlciBmb3IgTWVzb3Mgd2hpY2ggaGFuZGxlcyBkZXBlbmRlbmNpZXMgYW5kIElTTzg2MDEgYmFzZWQgc2NoZWR1bGVzLiIsInBhY2thZ2luZ1ZlcnNpb24iOiIyLjAiLCJ0YWdzIjpbImNyb24iLCJhbmFseXRpY3MiLCJiYXRjaCJdLCJwb3N0VW5pbnN0YWxsTm90ZXMiOiJUaGUgQ2hyb25vcyBEQ09TIFNlcnZpY2UgaGFzIGJlZW4gdW5pbnN0YWxsZWQgYW5kIHdpbGwgbm8gbG9uZ2VyIHJ1bi5cblBsZWFzZSBmb2xsb3cgdGhlIGluc3RydWN0aW9ucyBhdCBodHRwczovL2RvY3MubWVzb3NwaGVyZS5jb20vdXNhZ2Uvc2VydmljZXMvY2hyb25vcy8jdW5pbnN0YWxsIHRvIGNsZWFuIHVwIGFueSBwZXJzaXN0ZWQgc3RhdGUiLCJtYWludGFpbmVyIjoic3VwcG9ydEBtZXNvc3BoZXJlLmlvIiwic2VsZWN0ZWQiOnRydWUsImZyYW1ld29yayI6dHJ1ZSwidmVyc2lvbiI6IjIuNC4wIiwicHJlSW5zdGFsbE5vdGVzIjoiV2UgcmVjb21tZW5kIGEgbWluaW11bSBvZiBvbmUgbm9kZSB3aXRoIGF0IGxlYXN0IDEgQ1BVIGFuZCAyR0Igb2YgUkFNIGF2YWlsYWJsZSBmb3IgdGhlIENocm9ub3MgU2VydmljZS4iLCJpbWFnZXMiOnsiaWNvbi1zbWFsbCI6Imh0dHBzOi8vZG93bmxvYWRzLm1lc29zcGhlcmUuY29tL3VuaXZlcnNlL2Fzc2V0cy9pY29uLXNlcnZpY2UtY2hyb25vcy1zbWFsbC5wbmciLCJpY29uLW1lZGl1bSI6Imh0dHBzOi8vZG93bmxvYWRzLm1lc29zcGhlcmUuY29tL3VuaXZlcnNlL2Fzc2V0cy9pY29uLXNlcnZpY2UtY2hyb25vcy1tZWRpdW0ucG5nIiwiaWNvbi1sYXJnZSI6Imh0dHBzOi8vZG93bmxvYWRzLm1lc29zcGhlcmUuY29tL3VuaXZlcnNlL2Fzc2V0cy9pY29uLXNlcnZpY2UtY2hyb25vcy1sYXJnZS5wbmciLCJzY3JlZW5zaG90cyI6bnVsbH19',
    },
    mem: 2048,
    disk: 0,
    tasksStaged: 0,
    tasksRunning: 1,
    tasksHealthy: 1,
    tasksUnhealthy: 0
  });

  describe('#render', function () {
    beforeEach(function () {
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(
        <ServiceInfo onActionsItemSelection={() => {}} service={service} />,
        this.container
      );
      this.node = ReactDOM.findDOMNode(this.instance);
    });

    afterEach(function () {
      ReactDOM.unmountComponentAtNode(this.container);
    });

    it('renders name', function () {
      expect(this.node.querySelector('.h1 .collapsing-string-full-string').textContent).toEqual('test');
    });

    it('renders framework version', function () {
      this.container = document.createElement('div');
      this.instance = ReactDOM.render(
        <ServiceInfo onActionsItemSelection={() => {}} service={framework} />,
        this.container
      );
      this.node = ReactDOM.findDOMNode(this.instance);

      expect(this.node.querySelector('.h1 .collapsing-string-full-string').textContent).toEqual('chronosv. 2.4.0');
    });

    it('renders image', function () {
      expect(
        this.node.querySelector('.icon img').src
      ).toEqual('foo.png');
    });

    it('renders app status, not health state', function () {
      expect(
        this.node.querySelector('.page-header-sub-heading').children[0].children[0].textContent
      ).toEqual('Running');
    });

    it('renders number of running tasks', function () {
      expect(
        this.node.querySelector('.page-header-sub-heading').children[0].children[1].textContent
      ).toEqual('2 Tasks');
    });

  });
});
