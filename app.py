import os

from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_socketio import SocketIO, emit

from datetime import datetime

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = []
texts = []
names = []


class Channel:
    counter = 0

    def __init__(self, id, name, kind):
        self.id = Channel.counter
        self.name = name
        self.kind = kind  # Channel or DM
        Channel.counter += 1

    def print_info(self):
        print(f"id: {self.id}")
        print(f"channel: {self.name}")
        print(f"kind: {self.kind}")


class Message:
    counter = 0

    def __init__(self, id, user, channel_id, channel_name, text, timestamp):
        self.id = Message.counter
        self.user = user
        self.channel_id = channel_id
        self.channel_name = channel_name
        self.text = text
        self.timestamp = timestamp
        Message.counter += 1

    def print_info(self):
        print(f"id: {self.id}")
        print(f"user: {self.user}")
        print(f"channel_id: {self.channel_id}")
        print(f"channel_name: {self.channel_name}")
        print(f"text: {self.text}")
        print(f"timestamp: {self.timestamp}")


c = Channel(id=Channel.counter, name='General', kind='Channel')
channels.append(c)

d = Channel(id=Channel.counter, name='Counter', kind="Channel")
channels.append(d)

e = Channel(id=Channel.counter, name='Flack Bot', kind='DM')
channels.append(e)


start = str(datetime.now())
m = Message(id=Message.counter, user='Flack Bot', channel_id='0', channel_name='General',
            text='Welcome to Flack', timestamp=start)
texts.append(m)

n = Message(id=Message.counter, user='Flack Bot', channel_id='2', channel_name='Flack Bot',
            text='Private Message here!', timestamp=start)
texts.append(n)


@app.route("/")
def index():
    print("RENDER INDEX")
    channel_list = []
    contact_list = []
    for channel in channels:
        if channel.kind == 'Channel':
            channel_list.append(channel)

    for k in channels:
        if k.kind == 'DM':
            contact = {}
            contact["name"] = k.name
            contact["id"] = k.id
            contact_list.append(contact)
    return render_template('index.html', channels=channel_list, contacts=contact_list)


@app.route("/newchannel", methods=["POST"])
def newchannel():
    channelname = request.form.get("channelname")
    kind = request.form.get("kind")
    for channel in channels:
        if channelname == channel.name:
            return jsonify({"success": False})
            break
    else:
        # create Channel
        c = Channel(id=Channel.counter, name=channelname, kind=kind)
        channels.append(c)
        # c.print_info()
        channel_id = c.id
        return jsonify({"success": True, "id": channel_id})


@app.route("/<int:id>")
def channel(id):
    print('LOAD PAGE ID')
    print(id)
    messages = []
    counter = 0
    for j in channels:
        if j.id == id:
            header = j.name
    for i in texts:
        if i.channel_id == str(id):
            message = {}
            message["user"] = i.user
            message["text"] = i.text
            message["timestamp"] = i.timestamp
            messages.append(message)
            counter += 1

    print(messages)
    # loading all the message in this chat room to messages[]
    return jsonify({"header": header, "counter": counter, "messages": messages})


@socketio.on("send message")
def message(data):
    text = data["message"]["text"]
    user = data["message"]["user"]
    channel_id = data["message"]["id"]
    channel_name = data["message"]["channel_name"]
    print(text)
    print(user)
    print(channel_id)
    date = str(datetime.now())

    m = Message(id=Message.counter, user=user, channel_id=channel_id, channel_name=channel_name,
                text=text, timestamp=date)
    texts.append(m)

    # find total messages of this channel
    total = []
    for i in texts:
        if i.channel_id == channel_id:
            total.append(i.text)
    print(total)

    # remove the 101 message to keep first 100 messages in the channel
    if len(total) > 5:
        counter = -1
        for i in texts:
            counter += 1
            if i.channel_id == channel_id:
                del texts[counter]
                break

    message = [{"user": user, "text": text,
                "timestamp": date, "channel_id": channel_id, "channel_name": channel_name}]
    print(message)
    emit("receive message", {"message": message}, broadcast=True)


@socketio.on("new channel")
def menu(data):
    channelname = data["channel"]
    pageId = int(data["id"])
    channel = [{"name": channelname, "id": pageId}]
    emit("publish channel", {"channel": channel}, broadcast=True)


@socketio.on("new contact")
def contact(data):
    name = data["name"]
    names.append(name)
    emit("contact added", {"names": names}, broadcast=True)


# @app.route("/<username>")
# def load_user(username):
#     print('LOAD USER')
#     channel_list = []
#     contact_list = []
#     ch_count = 0
#     ct_count = 0

#     # load all channels
#     for i in channels:
#         if i.kind == 'Channel':
#             channel = {}
#             channel["name"] = i.name
#             channel["id"] = i.id
#             ch_count += 1
#             channel_list.append(channel)
#     print(channel_list)
#     # load all related DMs
#     for k in channels:
#         if k.kind == 'DM':
#             if username in k.name or k.name == "Flack Bot":
#                 contact = {}
#                 contact["name"] = k.name
#                 contact["id"] = k.id
#                 ct_count += 1
#                 contact_list.append(contact)
#     print(contact_list)

#     # load to client side
#     return jsonify({"channels": channel_list, "contacts": contact_list, "ch_count": ch_count, "ct_count": ct_count})
