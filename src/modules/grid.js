const _ = require("lodash");
const M = require("../mutations");

const state = [];

const mutations = {
  setCurrent(grid, current) {
    _.keys(grid).forEach(x => {
      _.keys(grid[x]).forEach(y => {
        delete grid[x][y];
      });
      delete grid[x];
    });
    _.assign(grid, current.grid);
  },
  applyEvent: M.tasksMuts
};

const actions = {
  // addGrid() {
  //   request
  //     .post("/events")
  //     .set("Authorization", this.$store.state.loader.token)
  //     .send({
  //       type: "task-created",
  //       name: potentialCard,
  //       color: this.task.color,
  //       deck: [this.$store.getters.member.memberId],
  //       inId: this.taskId
  //     })
  //     .end((err, res) => {
  //       if (err) return console.log(err);
  //     });
  // }
};

module.exports = {
  state,
  mutations,
  actions
};
