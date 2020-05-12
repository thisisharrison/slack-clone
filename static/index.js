const menuitem = Handlebars.compile(document.querySelector('#menuitems').innerHTML);
const template = Handlebars.compile(document.querySelector('#chatitem').innerHTML);
const contacttemp = Handlebars.compile(document.querySelector('#contactlist').innerHTML);

document.addEventListener('DOMContentLoaded', () => {
    // load page General
    // loadpage(0);
    // localStorage.setItem('pageId', 0);
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    if (!localStorage.getItem('pageId')) {
        localStorage.setItem('pageId', 0);
        loadpage(0);
        console.log("New Page Storage: " + localStorage.getItem('pageId'))
    } else {
        loadpage(parseInt(localStorage.getItem('pageId')));
        console.log("Return Page Storage: " + localStorage.getItem('pageId'))
    }

    // if username does not exist in local storage, set login box
    if (!localStorage.getItem('username')) {
        // show sign up modal
        $('#signup').modal('show');
        console.log("New user: Need to sign up")
    }
    // if return user, don't display sign up
    if (localStorage.getItem('username') != null) {
        const username = localStorage.getItem('username');
        document.querySelector('#displayname').innerHTML = username;
        console.log("Return user: " + username);
    }

    // function load_user(username) {
    //     alert(`LOAD USER FUNCTION - ${username}`)
    //     const request1 = new XMLHttpRequest();
    //     request1.open('GET', `/${username}`);
    //     request1.onload = () => {
    //         // const response1 = request1.responseText
    //         // const json1 = JSON.parse(response1)
    //         // alert(json1["contacts"][0]["name"])
    //         // document.querySelector('#channels').innerHTML = '';
    //         // document.querySelector('#active-contacts').innerHTML = '';
    //         console.log('onload user')
    //         // load all channels 
    //         // for (let k = 0; k < parseInt(json1["ch_count"]); k++) {
    //         //     let channel_name = json1["channels"][k]["name"]
    //         //     let channel_id = json1["channels"][k]["id"]
    //         //     const content = menuitem({ 'data_id': channel_id, 'channelname': channel_name });
    //         //     document.querySelector('#channels').innerHTML += content;
    //         // }
    //         // load active contacts from DM
    //         // for (let m = 0; m < parseInt(json1["ct_count"]); m++) {
    //         //     let channel_name = json1["contacts"][m]["name"]
    //         //     let channel_id = json1["contacts"][m]["id"]
    //         //     const content = menuitem({ 'data_id': channel_id, 'channelname': channel_name });
    //         //     document.querySelector('#active-contacts').innerHTML += content;
    //         // }
    //     }
    //     request1.send();
    //     return false;
    // }

    // new user set ups
    document.querySelector('#register').onsubmit = () => {
        // declare variable to display name
        const name = document.querySelector('#username').value;
        // new local storage item and save in local storage
        localStorage.setItem('username', name);
        console.log("New user: " + name);
        // update display name field in HTML
        document.querySelector('#displayname').innerHTML = name;
        $('#signup').modal('hide')
        // Clear input field
        document.querySelector('#displayname').value = '';
        socket.emit('new contact', { 'name': name });
        // Stop form from submitting
        return false;
    }

    // channel creation pt1
    document.querySelector('#channel').onclick = () => {
        // Clear input field
        document.querySelector('#channelname').value = '';
        document.querySelector('#channelinstruct').innerHTML = 'Please give channel an unqiue name.';
        document.querySelector('#create').disabled = false;
        // show new channel modal
        $('#createchannel').modal('show');
    }

    // channel creation pt2
    document.querySelector('#newchannel').onsubmit = () => {
        // declare variable for channel
        const channelname = document.querySelector('#channelname').value;

        // send to server for list checking
        const request = new XMLHttpRequest();
        request.open('POST', '/newchannel');

        request.onload = () => {
            // Extract JSON data from request
            const data = JSON.parse(request.responseText);
            // Update the Modal Instructions
            if (data.success) {
                $('#createchannel').modal('hide')
                console.log("Page created: " + data.id);
                const content = menuitem({ 'data_id': data.id, 'channelname': channelname });
                document.querySelector('#channels').innerHTML += content;
                loadpage(data.id);
                localStorage.setItem('pageId', data.id)
                console.log("Current ID: " + localStorage.getItem('pageId'));
                // Everyone sees the channel created
                socket.emit('new channel', { 'channel': channelname, 'id': data.id })
            }
            else {
                document.querySelector('#channelinstruct').innerHTML = 'Channel name already exists.';
                document.querySelector('#create').disabled = true;
            }
        }
        // Add data to form to send with request
        const data = new FormData();
        data.append('channelname', channelname);
        data.append('kind', 'Channel')
        // Send request
        request.send(data);
        // Return False to stay on same page
        return false;
    }

    socket.on('publish channel', data => {
        const current_id = parseInt(localStorage.getItem('pageId'))
        const new_id = parseInt(data.channel[0]["id"])
        const channelname = data.channel[0]["name"]
        if (new_id != current_id) {
            // alert('Success')
            const content = menuitem({ 'data_id': new_id, 'channelname': channelname });
            document.querySelector('#channels').innerHTML += content;
        };
    });

    // Set up links to load Message View
    document.querySelectorAll('.channel-link').forEach(link => {
        link.onclick = () => {
            const pageId = parseInt(link.dataset.page);
            localStorage.setItem('pageId', pageId);
            loadpage(pageId);
            return false;
        };
    });

    // Message view 
    function loadpage(id) {
        // alert(`LOAD PAGE FUNCTION - ${id}`)
        const request = new XMLHttpRequest();
        request.open('GET', `/${id}`);
        request.onload = () => {
            const response = request.responseText
            const json = JSON.parse(response)
            document.querySelector('#channelheader').innerHTML = json["header"]
            document.querySelector('#messagebody').innerHTML = '';

            for (let i = 0; i < parseInt(json["counter"]); i++) {
                let username = json["messages"][i]["user"]
                let timestamp = json["messages"][i]["timestamp"]
                let date = timestamp.substring(0, 19)
                let message = json["messages"][i]["text"]
                console.log(username + '|' + date + '|' + message + '|' + id)
                let newbubble = template({ 'username': username, 'date': date, 'message': message });
                document.querySelector('#messagebody').innerHTML += newbubble;
            }
        };
        request.send();
        localStorage.setItem('pageId', id);
        console.log("Loaded page: " + localStorage.getItem('pageId'));
        return false;
    };


    socket.on('connect', () => {
        document.querySelector('#sendmessage').onclick = () => {
            const text = document.querySelector('#message').value;
            let channel_id = localStorage.getItem('pageId')
            let user = localStorage.getItem('username')
            let channel_name = document.querySelector('#channelheader').innerHTML
            message = { "user": user, "id": channel_id, "text": text, "channel_name": channel_name }
            socket.emit('send message', { 'message': message });
            document.querySelector('#message').value = '';
            return false;
        };
    });
    // When receive broadcast
    socket.on('receive message', data => {
        // Get the data of the message
        const channel_id = parseInt(data.message[0]["channel_id"])
        const user = data.message[0]["user"]
        const timestamp = data.message[0]["timestamp"]
        let date = timestamp.substring(0, 19)
        const text = data.message[0]["text"]
        const channel_name = data.message[0]["channel_name"]
        // alert(channel_name)


        // check if user is on the page of the message
        const current_id = parseInt(localStorage.getItem('pageId'))
        // alert(`Message incoming from Channel: ${channel_id}, Current channel: ${current_id}`)

        if (channel_id == current_id) {
            let newbubble = template({ 'username': user, 'date': date, 'message': text });
            document.querySelector('#messagebody').innerHTML += newbubble;
        }

        // check if message is a private message
        const active_contacts = document.getElementById('active-contacts').innerText;

        const current_user = localStorage.getItem('username')
        if (channel_name.includes(current_user) && current_user != user && active_contacts.includes(channel_name) != true) {
            // alert('Success')
            const content = menuitem({ 'data_id': channel_id, 'channelname': channel_name });
            document.querySelector('#active-contacts').innerHTML += content;
        }
    });

    document.querySelector('#newmessage').onclick = () => {
        $('#pm-modal').modal('show');
    }

    socket.on('contact added', data => {
        // alert('success')
        const names = data.names
        document.querySelector('#pm-contacts').innerHTML = ''
        for (let i = 0; i < names.length; i++) {
            // alert(data.names[i])
            if (data.names[i] != localStorage.getItem('username')) {
                let newbubble = contacttemp({ 'name': data.names[i] });
                document.querySelector('#pm-contacts').innerHTML += newbubble;
            }
        }
    });

    document.querySelector('#pm-form').onsubmit = () => {
        $('#pm-modal').modal('hide');
        const names = document.querySelector('#pm-contacts')
        const name = names.options[names.selectedIndex].value
        const origin = localStorage.getItem('username')
        const channel_name = `${origin}, ${name}`
        // document.querySelector('#active-contacts').innerHTML += name

        const request = new XMLHttpRequest();
        request.open('POST', '/newchannel');

        request.onload = () => {
            // Extract JSON data from request
            const data = JSON.parse(request.responseText);
            // Update the Modal Instructions
            console.log("Page created: " + data.id);
            const content = menuitem({ 'data_id': data.id, 'channelname': channel_name });
            document.querySelector('#active-contacts').innerHTML += content;
            loadpage(data.id);
            localStorage.setItem('pageId', data.id)
            console.log("Current ID: " + localStorage.getItem('pageId'));
        }
        // Add data to form to send with request
        const data = new FormData();
        data.append('channelname', channel_name);
        data.append('kind', 'DM')
        // Send request
        request.send(data);
        // Return False to stay on same page
        return false;

    }

});