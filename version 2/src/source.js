console.log("hello world!");

//D3 stuff!

// var w = 960,
//     h = 500,
//     fill = d3.scale.category10(),
//     nodes = [],
//     foci = {
//       username: [location, 'messages']
//     };

// var vis = d3.select("body").append("svg:svg")
//     .attr("width", w)
//     .attr("height", h);

// var force = d3.layout.force()
//     .nodes(nodes)
//     .links([])
//     .gravity(0)
//     .size([w, h]);

// force.on("tick", function(e) {

//   // Push nodes toward their designated focus.
//   var k = .1 * e.alpha;
//   nodes.forEach(function(item, index) {
//     item.y += (foci[item.id].y - item.y) * k;
//     item.x += (foci[item.id].x - item.x) * k;
//   });

//   vis.selectAll("circle.node")
//       .attr("cx", function(d) { return d.x; })
//       .attr("cy", function(d) { return d.y; });
// });

// var inputMessageNode = function(username, message, time){
//   nodes.push({id: ~~(Math.random() * foci.length)});
//   force.start();

//   vis.selectAll("circle.node")
//       .data(nodes)
//     .enter().append("svg:circle")
//       .attr("class", "node")
//       .attr("cx", function(d) { return d.x; })
//       .attr("cy", function(d) { return d.y; })
//       .attr("r", 8)
//       .style("fill", function(d) { return fill(d.id); })
//       .style("stroke", function(d) { return d3.rgb(fill(d.id)).darker(2); })
//       .style("stroke-width", 1.5)
//       .call(force.drag);
// }, 1000);



//Socket stuff!

var socket = io.connect('http://localhost:8080');

var username;

socket.on('connect', function(){
  username = prompt('Enter Username.')
  socket.emit('adduser', username);
})

socket.on('updatechat', function(obj){
  var post = new Post(obj);
  var postView = new PostView({model: post});
  $('.messages').append(postView.render());
});

socket.on('updateusers', function(data){
  $('.users').empty();
  for (var key in data) {
    var user = new User(key);
    var userView = new UserView({model: user});
    $('.users').append(userView.render());
  }
});

socket.on('news', function (data) {
  socket.emit('my other event', { my: 'data' });
});


//backbone stuff!

var Friends = Backbone.Model.extend({});

var friendList = new Friends();

var User = Backbone.Model.extend({
  initialize: function(user) {
    this.set('username', user);
  }
});

var UserView = Backbone.View.extend({
  events: {
    "click" : "addToFriend"
  },
  render: function(){
    var html = '<div>' + this.model.escape('username')+ '</div>';
    return this.$el.html(html);
  },
  initialize: function(){
    this.model.on('change', function(){
      this.render();
    })
  },
  addToFriend: function(){
    var fL = friendList.get(this.model.get('username'));
    if (fL === true){
      fL = false;
    } else {
      fL = true;
    }
    friendList.set(this.model.get('username'), fL);
  }
})

var Post = Backbone.Model.extend({
  initialize: function(obj) {
    this.set('username', obj.username);
    this.set('message', obj.message);
    this.set('createdAt', obj.timeRecieved);
  }
})

var PostView = Backbone.View.extend({
  render: function(){
    var username2 = this.model.get('username');
    var friend = !!friendList.get(username2);
    var html = '<div class=' + friend.toString() + '>' + username2.toString() + ': ' + this.model.get('message').toString() + '</div>';
    return this.$el.html(html);
  },
  initialize: function(){
    this.model.on('change', function(){
      this.render();
    }, this);
    this.listenTo(friendList, 'change', function(){
      this.render();
    }, this);
  }
});

$(document).ready(function(){
    $('.submitter').on('click', function(){
      var data = $('.message').val();
      $('.message').val("");
      socket.emit('sendchat', data);
    });
    $('.message').keypress(function(e){
      if(e.which === 13) {
        $('.submitter').click();
      }
    })
})