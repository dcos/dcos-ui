import Item from './Item';

class TaskStat extends Item {

  constructor(item = {}) {
    super(item.stats || {});
  }

  getHealthyTaskCount() {
    if (this.get('counts')) {
      return this.get('counts').healthy || 0;
    }
    return 0;
  }

  getRunningTaskCount() {
    if (this.get('counts')) {
      return this.get('counts').running || 0;
    }
    return 0;
  }

  getStagedTaskCount() {
    if (this.get('counts')) {
      return this.get('counts').staged || 0;
    }
    return 0;
  }

  getUnhealthyTaskCount() {
    if (this.get('counts')) {
      return this.get('counts').unhealthy || 0;
    }
    return 0;
  }

  getAverageLifeTime() {
    if (this.get('lifeTime')) {
      return this.get('lifeTime').averageSeconds || 0;
    }
    return 0;
  }

  getMedianLifeTime() {
    if (this.get('lifeTime')) {
      return this.get('lifeTime').medianSeconds || 0;
    }
    return 0;
  }
}

module.exports = TaskStat;
