# twilioMessenger
Using text commands and Twilio API, people are able to join groups and broadcast messages to others in a group, managed by an admin as shown below.
![]('./docs/dashboard.png?raw=true')

Groups can be joined by texting 'New Group [groupname]' to a master Twilio number which handles the webhooks via the Twilio API.

Members can set their alias image in the group via 'New [alias] [image_url]'. They can send texts to others in the group via the command 'Msg [group] [message]'
