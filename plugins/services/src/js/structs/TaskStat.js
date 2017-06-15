import Item from "../../../../../src/js/structs/Item";

class TaskStat extends Item {
  isEmpty() {
    return (
      typeof this.get("stats") !== "object" ||
      !Object.keys(this.get("stats")).length
    );
  }

  getName() {
    return this.get("name");
  }

  getHealthyTaskCount() {
    const stats = this.get("stats") || {};
    if (stats.counts) {
      return stats.counts.healthy || 0;
    }

    return 0;
  }

  getRunningTaskCount() {
    const stats = this.get("stats") || {};
    if (stats.counts) {
      return stats.counts.running || 0;
    }

    return 0;
  }

  getStagedTaskCount() {
    const stats = this.get("stats") || {};
    if (stats.counts) {
      return stats.counts.staged || 0;
    }

    return 0;
  }

  getUnhealthyTaskCount() {
    const stats = this.get("stats") || {};
    if (stats.counts) {
      return stats.counts.unhealthy || 0;
    }

    return 0;
  }

  getAverageLifeTime() {
    const stats = this.get("stats") || {};
    if (stats.lifeTime) {
      return stats.lifeTime.averageSeconds || 0;
    }

    return 0;
  }

  getMedianLifeTime() {
    const stats = this.get("stats") || {};
    if (stats.lifeTime) {
      return stats.lifeTime.medianSeconds || 0;
    }

    return 0;
  }
}

module.exports = TaskStat;
