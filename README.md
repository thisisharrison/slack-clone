# Project 2 - Slack Clone

CS50 Web Programming with Python and JavaScript

Display Name: Using Bootstrap modal, user comes into the site and register if local storage does not have their username. 

Channel Creation and Channel List: Any user can create a channel, Flask checks if name exists, and return false if it does. User's new channel will also be broadcasted to everyone. New users will also be able to see the channels created before he or she joined. Channels are stored as objects and all channels stored in a list, which is then rendered by entering to index.html. 

Messages View: Using AJAX, user can see all message created in Single Page application. Messages are stored as objects. When new messages gets emit in other channels, Javascript Receive Message checks if user's currently viewing that channel ID. If they are, they will see the message immediately. Otherwise, they will see it when they enter through channel-link and pageload function. 

Flask also controls maximum number of messages per channel. If it reaches 101, the 1st message object will be deleted. 

Personal Touch: Users can private message with each other. As new users join, the available people to contact increases. Each private message is stored as channel object. 