# How to set up the AO on a Raspberry Pi Zero

This is a readme file for the 'AO for pi zero v0.2' torrent, which contains this readme plus a .img file.

The ao_pi_zero_v0.2.img file contains a complete boot drive image for a Raspberry Pi Zero. Simply flash the image to a microSD card, insert it into a Raspberry Pi Zero, and plug it in, and the pi will boot and automatically start hosting the AO. You will have to plug the pi into a screen and keyboard, log in as "doge" password "wowsuchpassword", and type "ifconfig" to find the local IP address. Then, navigate to that IP address in a browser, port 8003, to access the AO.

## How to flash the image file:

### Easy method - Use balenaEtcher.
	
	1. Download and install balenaEtcher, an open-source microSD flashing app.
	2. Open balenaEtcher and select the ao.img.gz file.
	3. Select your microSD card from the list and click Flash.

### Advanced method - Use dd

This should do it (untested):

	cat ao.img.gz | gunzip | dd of=/dev/sdb

	Replacing /dev/sdb with the path to the volume you will OVERWRITE.

## FAQ

### How do I access the AO on my Raspberry Pi?

	1. First, follow the "How to flash the image file" instructions above.
	2. Then, plug in your pi to power and a monitor and boot it up.
	3. Log in with username 'doge' and password 'wowsuchpassword'.
	4. Open a terminal (Ctrl-Alt-T) and type 'ifconfig' to get your IP address. (It will usually be on the second line of the second 'wlan0' section, usually in the format '192.168.0.xxx'.)
	5. On another computer, open a web browser and navigate to 'https://<IP address>', replacing '<IP address>' with the address you found in the previous step.

### What is the default user account?

	The default username is 'doge' with password 'wowsuchpassword'. Please change the password immediately (see next section).

	The root account is disabled by default but may still retain the (disabled) password 'disableroot'.

### How do I change my password?

	1. Open a terminal and enter 'passwd' and follow the instructions.

### How do I change my username?

	You must enable and log into a different account to change the name of your current account.

	1. Using the root account can be dangerous and is disabled by default. Enable root with 'sudo passwd root' (then follow the instructions to choose a password).
	2. Log out of the account you want to rename, then log into root with the password you just set.
	3. Open a terminal and enter (replacing 'mynewname' with your new username):

		groupadd mynewname
		usermod -d /home/mynewname -m -g mynewname -l mynewname doge

	4. Log out of root and log back into your account using your new username.
	5. Disable root by opening a terminal and typing 'sudo passwd --lock root'.

	Now, you must change a few places where the old username 'doge' appears in AO configuration files:

	1. Open a terminal and type:
		cd ao
		nano configuration.js
	2. Edit the 'clightning' 'dir' line, replacing 'doge' with your new username.
	3. Edit the 'sqlite3' 'file' line, replacing 'doge' with your new username.
	4. Edit the 'ssl-ao.conf' file using 'sudo nano /etc/nginx/snippets/ssl-ao.conf', replacing 'doge' with your new username.

	Note: Do NOT edit the 'bitcoind' 'username' line unless you are setting up bitcoin. The username 'doge' there is the same as the rpcuser in ~/.bitcoin/bitcoin.conf, and must be changed in both places.

### How do I enable SSH?

	First, change your password (see above).

	Use raspi-config:

	1. Open a terminal.
	2. Type 'sudo raspi-config' (then type your password when prompted).
	3. Press down to select '5 Interfacing Options' and press Enter.
	4. Select 'P2 SSH' and press Enter.
	5. Answer 'Yes' by pressing Enter.
	6. Wait and it should say 'The SSH server is enabled'.
	7. Press Enter, then use the right arrow key to navigate to 'Finish' and press Enter to exit raspi-config.

	SSH is now enabled! However, this is insecure for two reasons:

	1. The default username 'doge' and password 'wowsuchpassword' are the same on all fresh AO pi installs. That means anyone could log in via SSH if you haven't changed your password. Make sure you change your password before enabling SSH! (see instructions above)
	2. Password login via SSH is considered insecure. The preferred method for secure SSH login is to use a a public/private pair of SSH key files.

	How to set up secure SSH login (with private keys):

	1. On the computer you will be accessing the AO pi from, open a terminal and enter 'ssh-keygen'.
	2. Enter a filename for the new pair of key files.
	3. Choose a password (optional but recommended—you must keep either the private key file itself secure [no insecure backups, no online exposure] or know the password is secure).
	4a. Copy the the yourpubkey.pub file to the AO pi. There are two ways to do this:
		a. Use a USB drive to move the .pub file to the raspberry pi.
		b. Open a terminal and enter 'cat yourpubkey.pub >> ~/.ssh/authorized_keys'
		c. Open the file and confirm the newlines are in the right place with 'nano ~/.ssh/authorized_keys'.
	4b. Or, use ssh-copy-id to copy the key to the AO pi:
		a. On the AO pi, open a terminal and type 'ifconfig' to get the IP address. (It will usually be on the second line of the second 'wlan0' section, usually in the format '192.168.0.xxx'.)
		b. On the computer you generated the keys on (and plan to access the AO *from*), open a terminal and enter 'ssh-copy-id -i ~/path/to/private/keyfile doge@ipfromstepa' (replacing 'ipfromstepa' with the IP address of the AO pi you got in step a.')
		c. Type your password when prompted and the key should install correctly.
	5. Now, test that SSH works by using your keyfile to SSH into the AO pi:

		ssh -i /path/to/private/keyfile doge@<ip of pi>

		If you set a password on your *keyfile*, you will be prompted for it. However, you should not be prompted for a password for the account you are logging into on the AO pi.
	6. Finally, disable password login for SSH:
		a. Edit the ssh config file with 'sudo nano /etc/ssh/sshd_config'.
		b. Set the following lines to 'no' (remove any leading #'s to uncomment the line):
			ChallengeResponseAuthentication no
			PasswordAuthentication no
			UsePAM no
			PermitRootLogin no
		c. Press Ctrl-O, then Enter to save the file. Then press Ctrl-X to exit.
		d. Restart SSH with 'sudo systemctl reload ssh'.

### How do I disable the GUI desktop?

	The GUI uses significant resources (and is a big sluggish to use, anyway), so you can attain somewhat better server performance by disabling it. After you have set up your AO pi, or if you are comfortable with the terminal, here's how you disable the GUI:

	1. Open a terminal and enter 'sudo raspi-config'.
	2. Select '3 Boot Options' and press Enter.
	3. Press Enter to select 'B1 Desktop / CLI'.
	4. Select 'B1 Console' to disable the GUI (or 'B3 Desktop' to reenable). (Note: For security, autologin options are not recommended).
	5. Use the right arrow to select 'Finish' and press Enter.
	6. Press Enter to select 'Yes' to reboot now.

### Why is my Raspberry Pi Zero W slow?

	The Raspberry Pi Zero W is incredibly cheap, but has only a single-core 1GHz processor. This is fast but lower-bandwidth than most processors today, which are commonly eight-core 2GHz processors. That is 2x the speed, 8x the bandwidth for 16x as much processing power—so the typical laptop will run code up to 16 times faster than the Raspberry Pi Zero.

	This means that if compiling the AO on my laptop takes about 1 minute, it will take 16 times or more longer the Raspberry Pi—currently it takes 20-30 minutes to compile the AO on the Raspberry Pi.

	The background processes for bitcoin and the lightning network use some of the pi's processing power. If you are not using the bitcoin and lightning features of the AO, you can disable these with 'sudo systemctl bitcoin disable' and 'sudo systemctl lightning disable' and then restart or enter 'sudo systemctl bitcoin stop' and 'sudo systemctl lightning stop' to stop the processes immediately.

	The desktop GUI also takes significant resources and can be disabled with raspi-config (see previous section).

	Disabling these three things will make using the pi and SSHing into it quite snappy.

### How can I access my AO install from anywhere in the world?
	
	If you are on a local network, you will be able to access the AO on your pi from anywhere on the local network. But, without setting up a port forward, you usually won't be able to access your AO server from the internet at large.

	To expose your pi to the wide area network (WAN), you must modify your router settings to set up a port forward. Router settings are idiosyncratic, so you will have to find out how to log into your router and find the "port forward" settings on your own. Here are the general steps:

		1. On the AO pi, open a terminal and enter 'ifconfig' to the local area network (LAN) IP address. (It will usually be on the second line of the second 'wlan0' section, usually in the format '192.168.0.xxx'.)
		2. Access your router's web interface and log in as administrator (you or whoever set up the router should have this username and password—often the default password is unchanged and is printed on the router somewhere).
		3. Find the 'port forwarding' settings in your router's web interface. Search online to find where these settings are located for your router.
		4. Enter the AO pi's IP address as the internal/LAN IP in the port forwarding settings.
		5. Enter port 8003 for the AO PI's internal port.
		6. Enter port 8003 (or any port of your choice) for the external (WAN) port.
		7. Note the external (WAN) IP address of the router. (This will usually NOT be in the format '192.168.0.xxx').
		8. From a computer not connected to your wifi or LAN, navigate to the external IP address of your router/network, port 8003. For example:

			https://167.182.9.185:8003

			(replacing the IP address with your own router's external IP)

	This should allow you to access your AO pi from any web browser connected to the internet!

### Any caveats?

	CAUTION: It is currently still possible to access the AO without encryption using http://. For security, ALWAYS access the AO using https://. If you use http (without the s), your username and other information will be sent in plaintext, and could be read by anyone. (As long as you use https://, all traffic between you and the AO will be encrypted.) Non-https access will be disabled in a future AO pi image release.

---

#  How to dogeify a Raspberry Pi (steps that can't be automated in pi_install.sh yet)

Instructions for creating a clean install of a Raspberry Pi with the AO on it (for cloning to other pis).

## Disable autologin (Raspbian Full)
nano /etc/systemd/system/autologin@.service
add # to beginning of "ExecStart=-/sbin/agetty --autologin pi --noclear %I $TERM" line

or

comment out (#) autologin line in /etc/lightdm/lightdm.conf

## Change username from pi to doge (Raspbian Lite)
sudo passwd root
	set a temp password
logout

login as root with your new password

groupadd doge
usermod -l doge -aG doge -m -d /home/doge pi
logout
login as doge
sudo passwd --lock root

## Create doge user and delete default pi user (Raspbian Full)
set root passwod and login as root as above
useradd -m doge
userdel -r -f pi
usermod -aG sudo doge

## Change raspi-config settings

sudo raspi-config
	set hostname to ao
	change user password to wowsuchpassword
	reboot when prompted (or type reboot)

## Download and run the install script

wget https://raw.githubusercontent.com/coalition-of-invisible-colleges/ao/panelcontext/pi_install.sh
chmod u+x pi_install.sh
./pi_install.sh

now wait for the AO to install. the script will automatically compile and install the AO's dependencies and also runs apt update and apt upgrade. on a Raspberrpy Pi Zero W, this takes several hours.

finally, use sudo raspi-config again to disable SSH

now rip the microSD image and you've got a mother pi

# Mount a hard drive automatically at startup
get UUID with sudo blkid

add a line to /etc/fstab:

sudo mkdir /mnt/backup

UUID=<UUID> /mnt/backup ext4 defaults,rw,auto,nofail 0 0
p0wn the folders

sudo mount -a

# set up a server to receive backups via borgbackup

1. Set up hard drive to automatically mount at startup (above).
2. Create a directory /var/lib/tor/backup.
	a. chown pi:pi -R /var/lib/tor/backup
	b. chmod 700 /var/lib/tor/backup
3. ssh-copy-id -i /path/to/ssh/key.file doge@192.168.0.xxx

# fix pipe and backslash on wireless keyboard

sudo nano /etc/default/keyboard
	XKBMODEL="pc105"
	XKBLAYOUT="us"

# add SSH keys

# add default doge SSH key

# get tor hostnames

# add borgbackup tor line

# still todo
- improve tor auto-setup (required: real knowledge of how tor setup is supposed to be)
- implement borg-backup auto-setup (or add as AO feature)