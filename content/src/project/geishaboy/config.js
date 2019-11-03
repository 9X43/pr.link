module.exports = {
  name: "GeishaBoy.tf",
  description: "A site featuring my collection of the item \"Geisha Boy\" from the video game Team Fortress 2.",
  keywords: ["Website", "Team Fortress 2"],
  created: "NOV 2019",

  display_on_frontpage: true,

  pug_data: {
    get collection() {
      let meta = require("./js/geisha_data.js");

      meta.stats = {
        collected: 0,
        total: 0
      };

      meta.series.forEach(update => {
        update.stats = {
          collected: update.effects.filter(e => e.collected).length,
          total: update.effects.length
        }

        meta.stats.collected += update.stats.collected;
        meta.stats.total += update.stats.total;
      });

      return meta;
    }
  }
}
