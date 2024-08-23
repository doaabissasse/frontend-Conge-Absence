// Workflow.js
class Task {
    constructor(id, status, data) {
      this.id = id;
      this.status = status;
      this.data = data;
      this.supervisorApproved = false;
    }
}
  
class Workflow {
    constructor(users, status = "pending") {
      this.id = undefined;
      this.users = users;
      this.confirmedUsers = [];
      this.status = status;
      this.task = undefined;
      this.lastUser = undefined;
      this.firstUser = users[0];
    }
  
    createTask(data) {
      this.task = new Task(this.users[0], "pending", data);
    }
  
    getCurrentUser() {
      return this.users[0];
    }
  
    nextUser() {
      let removedUser = this.users.shift();
      this.confirmedUsers.push(removedUser);
      return this.getCurrentUser();
    }
  
    denyTask() {
      this.status = "denied";
      this.task.status = "denied";
    }
  
    approveTask() {
      if (this.users.length === 1 && this.task.supervisorApproved) {
        this.status = "approved";
        this.task.status = "approved";
      } else if (this.users.length > 1) {
        this.task.supervisorApproved = true;
        this.nextUser();
      }
    }
  
    renderForm() {
      if (this.firstUser === this.getCurrentUser()) {
        document
          .querySelector(`.${this.getCurrentUser()}Form`)
          .classList.toggle("shown");
      } else {
        document
          .querySelector(`.${this.firstUser}Form`)
          .classList.toggle("shown");
      }
    }
  
    renderMessage() {
      const message = `The request is ${this.task.status}`;
      if (this.confirmedUsers.length > 0) {
        this.confirmedUsers.forEach((user) => {
          document.querySelector(`.${user}Message`).classList.add("shown");
        });
        document.querySelectorAll(".taskStatus").forEach((element) => {
          element.innerText = message;
        });
      }
    }
  
    renderButtons() {
      document
        .querySelector(`.${this.getCurrentUser()}Buttons`)
        .classList.toggle("shown");
      if (
        document
          .querySelector(
            `.${this.confirmedUsers[this.confirmedUsers.length - 1]}Buttons`
          )
          .classList.contains("shown")
      ) {
        document
          .querySelector(
            `.${this.confirmedUsers[this.confirmedUsers.length - 1]}Buttons`
          )
          .classList.toggle("shown");
      }
    }
  
    render() {
      if (this.users.length === 1) {
        this.approveTask();
        this.renderMessage();
      } else if (this.users.length > 1) {
        this.nextUser();
      }
    }
}
  