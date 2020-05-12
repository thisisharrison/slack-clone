# channels = ['1']
# x = '2'

# for channel in channels:
#     if channel != x:
#         channels.append(x)

# print(channels)

# texts = {'General': ['Welcome', 'Testing']}
# print(texts["General"][0])

# from datetime import datetime


# class Message:

#     def __init__(self, user, channel, text, timestamp):
#         self.user = user
#         self.channel = channel
#         self.text = text
#         self.timestamp = timestamp


# now = datetime.now()
# m = Message(user='mike', channel='test',
#             text='hello', timestamp=now)


# class Channel:
#     counter = 0

#     def __init__(self, id, name):
#         self.id = Channel.counter
#         self.name = name
#         Channel.counter += 1


# c = Channel(id=Channel.counter, name='name')
# print(c.id)
# c1 = Channel(id=Channel.counter, name='name1')
# print(c1.id)

# texts = []


# class Message:
#     counter = 0

#     def __init__(self, id, user, channel_id, text, timestamp):
#         self.id = Message.counter
#         self.user = user
#         self.channel_id = channel_id
#         self.text = text
#         self.timestamp = timestamp
#         Message.counter += 1


# m = Message(id=Message.counter, user='admin', channel_id='0',
#             text='Welcome to Flack', timestamp='0001')
# texts.append(m)
# m1 = Message(id=Message.counter, user='admin', channel_id='0',
#              text='Welcome to Flack2', timestamp='0002')
# texts.append(m1)


# messages = []
# for i in texts:
#     if i.channel_id == '0':
#         message = {}
#         message["user"] = i.user
#         message["text"] = i.text
#         message["timestamp"] = i.timestamp
#         messages.append(message)
# print(messages)


p = {"header": "General", "messages": [{"text": "Welcome to Flack", "timestamp": "Tue, 05 May 2020 22:18:21 GMT", "user": "admin"}, {"text": "yuppe", "timestamp": "Tue, 05 May 2020 22:18:46 GMT", "user": "harry"}, {
    "text": "ee", "timestamp": "Tue, 05 May 2020 22:18:49 GMT", "user": "harry"}, {"text": "cc", "timestamp": "Tue, 05 May 2020 22:18:51 GMT", "user": "harry"}, {"text": "qqqq", "timestamp": "Tue, 05 May 2020 22:18:53 GMT", "user": "harry"}]}
print(p['messages'][0]["text"])
