window.onload = function () {
    
    var messages = [];
    var socket = io.connect('http://localhost:1337');
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var name = document.getElementById("name");

    
    socket.on('message', function (data) {
        if (data.message) {
            messages.push(data);
            var html = '';
            for (var i = 0; i < messages.length; i++) {
                html += '<b>' + (messages[i].username ? messages[i].username : 'Start your chat') + ': </b>';
                html += messages[i].message + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem:", data);
        }
    });
    
    $('#field').keypress(function (e) {
        if (e.which === 13) {
            $('#send').trigger('click');
            $('#field').val('');
        }
    });
    
    sendButton.onclick = function () {
        var text = field.value;
        socket.emit('send', { message: text, username: name.value });
    };

}
