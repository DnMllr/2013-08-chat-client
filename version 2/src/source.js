console.log("hello world!");

//Socket stuff!

//jquery/D3 stuff!

$(document).ready(function(){

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
    $('.users').append(userView.render());
  }
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

    var height = 500;
    var width = 700;

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
    if (messageList[obj.username] === undefined) {
      messageList[obj.username] = [[obj.message, obj.timeRecieved]];
    } else {
      messageList[obj.username].push([obj.message, obj.timeRecieved]);
    }
  }
})


var PostView = Backbone.View.extend({
  render: function(){
    var username2 = this.model.get('username');
    var friend = !!friendList.get(username2);
    var html = '<div class=' + friend.toString() + '>' + username2.toString() + ': ' + this.model.get('message').toString() + '</div>';
    var messages = svg.selectAll('circle.' + username2)
      .data(messageList[username2])
      .enter().append('svg:circle')
      .attr('class', username2)
      .attr('cx', width*Math.random())
      .attr('cy', height*Math.random())
      .attr('r', 8)
      .style('fill', 'blue')
      .on('mouseover', function(d){
        var circle = d3.select(this);
        circle.transition().attr('r', 100);
        circle.append('svg:text').text(d[0]);
        console.log(d[0]);
      })
      .on('mouseout', function(d){
        var circle = d3.select(this);
        circle.empty();
        circle.transition().attr('r', 8);
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