export default class Estimator {
  constructor(template) {
    this.setEstimator(template);
  }

  setEstimator(template) {
    this.estimator = Object.assign({}, template);
  }

  getEstimator() {
    return Object.assign({}, this.estimator);
  }

  addTaskClassification(taskClassification) {
    return new Promise((resolve, reject) => {
      if (
        this.estimator.taskClassification.indexOf(taskClassification) === -1
      ) {
        this.estimator.taskClassification.push(taskClassification);
        resolve(true);
      } else {
        reject(false);
      }
    });
  }

  removeTaskClassification(taskClassification) {
    return new Promise((resolve, reject) => {
      let index = this.estimator.taskClassification.indexOf(taskClassification);
      if (index !== -1) {
        this.estimator.taskClassification = this.estimator.taskClassification.splice(
          index,
          1
        );
        resolve(true);
      } else {
        reject(false);
      }
    });
  }
}
