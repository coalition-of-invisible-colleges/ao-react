echo warning: this script will change your username to 'doge' and your password to 'wowsuchpassword'.
read -p "are you ready to experience dogeified administration? " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
	sudo useradd -m tempuser -s /bin/bash
	echo "tempuser" | passwd --stdin linuxuser
	sudo usermod -a -G sudo tempuser
	# now use the temporary account with su or sudo -u to rename myself
	sudo -u tempuser #command goes here
fi