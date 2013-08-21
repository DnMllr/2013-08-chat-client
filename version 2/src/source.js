console.log("hello world!");

//Socket stuff!

//jquery/D3 stuff!

$(document).ready(function() {

  var socket = io.connect('10.1.1.14:8080');

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
      $('.users').prepend(userView.render());
    }
    // for (var key in messageList) {
    //   if (data[key] === undefined) {
    //     delete messageList[key];
    //   }
    // }
  });

  socket.on('news', function (data) {
    socket.emit('my other event', { my: 'data' });
  });

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

      var height = 900;
      var width = 1400;

      var fill = d3.scale.category20();

      var svg = d3.select('body').append('svg:svg')
        .attr('width', width)
        .attr('height', height)






//backbone stuff!

var Friends = Backbone.Model.extend({});

var friendList = new Friends();

var messageList = {};

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
    this.set('x', Math.random()*width)
    this.set('y', Math.random()*height)
    if (messageList[obj.username] === undefined) {
      messageList[obj.username] = [{message: this.get('message'), createdAt: this.get('timeRecieved'), x: this.get('x'), y: this.get('y')}];
    } else {
      messageList[obj.username].push({message: this.get('message'), createdAt: this.get('timeRecieved'), x: this.get('x'), y: this.get('y')});
    }
  }
})

var listMessages = []

for (var key in messageList) {
    var temp = [];
    for (var i = 0 ; i < messageList[key].length ; i++) {
      temp = [key, messageList[key][i][0], messageList[key][i][0]]
      listMessages.push(temp);
    }
  }


var PostView = Backbone.View.extend({
  render: function(){

    var username2 = this.model.get('username');
    var friend = !!friendList.get(username2);
    var message3 = this.model.get('message').toString();
    var html = '<div class=' + friend.toString() + '>' + username2.toString() + ': ' + message3 + '</div>';

    var size = Object.keys(messageList).length

    var force = d3.layout.force()
        .nodes(messageList[username2])
        .links([])
        .gravity(0)
        .size([[width, height]])
        .start();

    foci = {}
    var counter = 1;

    for (var key in messageList) {
      foci[key] = {x: (width/(Object.keys(messageList).length))*((counter++)-0.5), y: height/3, id: counter}
    }

    force.on('tick', function(e){

      var k = .1*e.alpha;
      messageList[username2].forEach(function(node){
        node.y += (foci[username2].y - node.y)*k;
        node.x += (foci[username2].x - node.x)*k;
      })

      svg.selectAll('circle.' + username2).attr('cx', function(d){return d.x;}).attr('cy', function(d){return d.y;});
    })

    var messages = svg.selectAll('circle.' + username2)
      .data(messageList[username2])
      .enter().append('svg:circle')
      .attr('class', username2)
      .attr('cx', width*Math.random())
      .attr('cy', height*Math.random())
      .attr('r', 8)
      .attr('fill', function(d){return fill(foci[username2].id);})
      .attr('opacity', 0.4)
      .on('mouseover', function(d){
        var circle = d3.select(this);
        circle.append('div').attr('z-index', 1000).text(message3);
        circle.transition().attr('r', 100).attr('opacity', 0.2);
        var fL = friendList.get(username2);
        if (fL === true){
          fL = false;
        } else {
          fL = true;
        }
        friendList.set(username2, fL);
        console.log(message3);
      })
      .on('mouseout', function(d){
        var circle = d3.select(this);
        circle.empty();
        var fL = friendList.get(username2);
        if (fL === true){
          fL = false;
        } else {
          fL = true;
        }
        friendList.set(username2, fL);
        circle.transition().attr('r', 8).attr('opacity', 0.4);
      });
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



})