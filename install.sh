# This script installs the AO on your computer.

# It automatically detects whether you are running a Debian/Ubuntu/Raspbian or Arch/Manjaro distro
# and does all the same steps a human would have to do to install the AO on that system.

# To run it, first give it execute permissions with 'chmod u+x install.sh',
# then run with './install.sh'.

# detect OS
if [ -f "/etc/debian_version" ]; then
	DISTRO="debian"
	echo "Debian, Ubuntu, or Raspbian OS detected, proceeding with Debian-compatible AO installation."
elif [ -f "/etc/arch-release" ]; then
	DISTRO="arch"
	echo Arch- or Manjaro-based OS detected, proceeding with Arch-compatible AO installation.
else
	echo Could not detect your OS distribution. Running this script could make a mess, so installing manually is recommended.
	exit 1
fi

# make AO data and memes directories
cd ~
if [ ! -d "$HOME/.ao/memes" ]; then
	mkdir -p $HOME/.ao/memes
fi

# update system and install prereqs (Debian)
if [ "$DISTRO" = "debian" ]; then
	# update
	sudo apt update -yqqq 2>/dev/null
	sudo apt autoremove -yqqq
	echo apt update complete

	# upgrade
	sudo apt upgrade -yqqq
	echo apt upgrade complete

	# more cleanup
	#sudo apt-get dist-upgrade -yqqq
	#sudo apt-get clean -yqqq
	#sudo apt-get autoclean -yqqq

	# check for sudo install and fail if not

	# install curl
	if [ $(dpkg-query -W -f='${Status}' curl 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo curl already installed
	else
		sudo apt install -y curl
	fi

	# install wget
	if [ $(dpkg-query -W -f='${Status}' wget 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo wget already installed
	else
		sudo apt install -y wget
	fi

	# install git
	if [ $(dpkg-query -W -f='${Status}' git 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo git already installed
	else
		sudo apt install -y git
	fi

	# install sqlite3
	if [ $(dpkg-query -W -f='${Status}' sqlite3 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo sqlite3 already installed
	else
		sudo apt install -y sqlite3
	fi

	# do we need make and gcc?

# update system and install prereqs (Arch)
else
	# update, but do not automatically clean up for Arch users
	sudo pacman -Syu 1>/dev/null
	echo pacman update complete

	# todo: detect whether AUR is enabled here and fail if not. might be in /etc/pacman.conf.

	# install curl
	if [ $(sudo pacman -Qs curl >/dev/null | grep -c "local/curl" ) -eq 0 ]; then
		echo curl already installed
	else
		sudo pacman -S curl
	fi

	# install wget
	if [ $(sudo pacman -Qs wget >/dev/null | grep -c "local/wget" ) -eq 0 ]; then
		echo wget already installed
	else
		sudo pacman -S wget
	fi

	# install git
	if [ $(sudo pacman -Qs git >/dev/null | grep -c "local/git" ) -eq 0 ]; then
		echo git already installed
	else
		sudo pacman -S git
	fi

	# install sqlite3
	if [ $(sudo pacman -Qs sqlite >/dev/null | grep -c "local/sqlite" ) -eq 0 ]; then
		echo sqlite already installed
	else
		sudo pacman -S sqlite
	fi
fi

# install nvm
cd ~
if [ -f "$HOME/.nvm/nvm.sh" ]; then
	. ~/.nvm/nvm.sh
fi

if [ $(command -v nvm | grep -c "nvm") -eq 1 ]; then
	NVMVERSION=`nvm --version`
	echo nvm v$NVMVERSION already installed
else
	git clone https://github.com/creationix/nvm.git ~/.nvm 2>/dev/null
	sudo echo "source ~/.nvm/nvm.sh" >> ~/.bashrc
	sudo echo "source ~/.nvm/nvm.sh" >> ~/.profile
	source ~/.bashrc
	source ~/.profile
fi

NODEVERSION=`nvm current`

# install node
if [ $(echo $NODEVERSION | grep -c "15\.") -eq 1 ]; then
	echo node $NODEVERSION already installed
else
	nvm install stable
	nvm use stable
	nvm alias default stable
fi

# install npm
if [ $(npm --v  2>/dev/null | grep -c "6\.") -eq 1 ]; then
	NPMVERSION=`npm -v`
	echo npm v$NPMVERSION already installed
else
	curl -L https://www.npmjs.com/install.sh | sh
	npm install -g npm # why doesn't the npm install script install the current version?
fi

# install c-lightning prereqs (Debian)
if [ "$DISTRO" = "debian" ]; then
	# test these to see which are optional. autodev-tools might be optional.
	if [ $(dpkg-query -W -f='${Status}' zlib1g-dev 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo zlib1g-dev already installed
	else
		sudo apt install -y zlib1g-dev
	fi

	if [ $(dpkg-query -W -f='${Status}' libtool 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo libtool already installed
	else
		sudo apt install -y libtool
	fi

	if [ $(dpkg-query -W -f='${Status}' autoconf 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo autoconf already installed
	else
		sudo apt install -y autoconf
	fi

	if [ $(dpkg-query -W -f='${Status}' automake 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo automake already installed
	else
		sudo apt install -y automake
	fi

	if [ $(dpkg-query -W -f='${Status}' autotools-dev 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo autotools-dev already installed
	else
		sudo apt install -y autotools-dev
	fi

	if [ $(dpkg-query -W -f='${Status}' libgmp-dev 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo libgmp-dev already installed
	else
		sudo apt install -y libgmp-dev
	fi

	if [ $(dpkg-query -W -f='${Status}' libsqlite3-dev 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo libsqlite3-dev already installed
	else
		sudo apt install -y libsqlite3-dev
	fi

	if [ $(dpkg-query -W -f='${Status}' python 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo python already installed
	else
		sudo apt install -y python
	fi

	if [ $(dpkg-query -W -f='${Status}' python3 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo python3 already installed
	else
		sudo apt install -y python3
	fi

	if [ $(dpkg-query -W -f='${Status}' python3-mako 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo python3-mako already installed
	else
		sudo apt install -y python3-mako
	fi

	if [ $(dpkg-query -W -f='${Status}' libsodium-dev 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo libsodium-dev already installed
	else
		sudo apt install -y libsodium-dev
	fi

# install c-lightning prereqs (Arch)
else
	if [ $(sudo pacman -Qs zlib >/dev/null | grep -c "local/zlib" ) -eq 0 ]; then
		echo zlib already installed
	else
		sudo pacman -S zlib
	fi

	if [ $(sudo pacman -Qs libtool >/dev/null | grep -c "local/libtool" ) -eq 0 ]; then
		echo libtool already installed
	else
		sudo pacman -S libtool
	fi

	if [ $(sudo pacman -Qs autoconf >/dev/null | grep -c "local/autoconf" ) -eq 0 ]; then
		echo autoconf already installed
	else
		sudo pacman -S autoconf
	fi

	if [ $(sudo pacman -Qs automake >/dev/null | grep -c "local/automake" ) -eq 0 ]; then
		echo automake already installed
	else
		sudo pacman -S automake
	fi

	if [ $(sudo pacman -Qs python2 >/dev/null | grep -c "local/python2" ) -eq 0 ]; then
		echo python2 \(legacy\) already installed
	else
		sudo pacman -S python2
	fi

	if [ $(sudo pacman -Qs python >/dev/null | grep -c "local/python" ) -eq 0 ]; then
		echo python already installed
	else
		sudo pacman -S python
	fi

	if [ $(sudo pacman -Qs python-mako >/dev/null | grep -c "local/python-mako" ) -eq 0 ]; then
		echo python-mako already installed
	else
		sudo pacman -S python-mako
	fi
fi

# install c-lightning
if [ $(lightning-cli --version 2>/dev/null | grep -c "v0\.10\.") -eq 1 ]; then
	echo c-lightning v0.10.x already installed
else
	cd ~
	git clone https://github.com/ElementsProject/lightning.git
	lightning=true
	cd lightning
	./configure
	make
	sudo make install
fi

# bitcoin: download a hosted copy of the current bitcoin executable for pi

# install tor
if [ $(tor --version  2>/dev/null | grep -c "0\.4\.4\.6") -eq 1 ]; then
	echo tor v0.4.4.6 already installed
else
	if [ "$DISTRO" = "debian" ]; then
		if [ $(dpkg-query -W -f='${Status}' build-essential 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
			sudo apt install -y build-essential
		fi

		if [ $(dpkg-query -W -f='${Status}' fakeroot 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
			sudo apt install -y fakeroot
		fi

		if [ $(dpkg-query -W -f='${Status}' devscripts 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
			sudo apt install -y devscripts
		fi

		if [ $(dpkg-query -W -f='${Status}' libevent-dev 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
			sudo apt install -y libevent-dev
		fi

		if [ $(dpkg-query -W -f='${Status}' libssl-dev 2>/dev/null | grep -c "ok installed") -eq 0 ]; then
			sudo apt install -y libssl-dev
		fi
	else
		if [ $(sudo pacman -Qs build-essential >/dev/null | grep -c "local/build-essential" ) -eq 1 ]; then
			sudo pacman -S build-essential
		fi

		if [ $(sudo pacman -Qs fakeroot >/dev/null | grep -c "local/fakeroot" ) -eq 1 ]; then
			sudo pacman -S fakeroot
		fi

		if [ $(sudo pacman -Qs devscripts >/dev/null | grep -c "local/devscripts" ) -eq 1 ]; then
			sudo pacman -S devscripts
		fi

		if [ $(sudo pacman -Qs libevent >/dev/null | grep -c "local/libevent" ) -eq 1 ]; then
			sudo pacman -S libevent
		fi

		if [ $(sudo pacman -Qs libssl >/dev/null | grep -c "local/libssl" ) -eq 1 ]; then
			sudo pacman -S libssl
		fi
	fi

	cd ~
	wget https://dist.torproject.org/tor-0.4.4.6.tar.gz
	tor=true
	tar xf tor-0.4.4.6.tar.gz
	cd tor-0.4.4.6
	./configure
	make
	sudo make install
fi

# configure tor
TORRCPATH='/usr/local/etc/tor/torrc'
if [ ! -d "/usr/local/etc/tor" ]; then
	sudo mkdir -p /usr/local/etc/tor
fi

if [ ! -f $TORRCPATH ]; then
	wget https://raw.githubusercontent.com/torproject/tor/master/src/config/torrc.sample.in
	sudo mv torrc.sample.in $TORRCPATH
fi

if [ $(cat $TORRCPATH | grep -c "HiddenServiceDir /var/lib/tor/ao") -eq 0 ]; then
	echo "HiddenServiceDir /var/lib/tor/ao" | sudo tee -a $TORRCPATH 1>/dev/null 2>&1
fi

if [ $(cat $TORRCPATH | grep -c "HiddenServicePort 80 127\.0\.0\.1:8003") -eq 0 ]; then
	echo "HiddenServicePort 80 127.0.0.1:8003" | sudo tee -a $TORRCPATH 1>/dev/null 2>&1
fi

if [ ! -d "/var/lib/tor/ao" ]; then
	sudo mkdir -p /var/lib/tor/ao
fi

sudo chown -R $USER:$USER /var/lib/tor
sudo chmod -R 700 /var/lib/tor

# get ao tor hostname for configuration.js
if [ -f "/var/lib/tor/ao/hostname" ]; then
	TORHOSTNAME=`cat /var/lib/tor/ao/hostname`
fi

# install borgbackup (Debian)
if [ "$DISTRO" = "debian" ]; then
	if [ $(dpkg-query -W -f='${Status}' borgbackup 2>/dev/null | grep -c "ok installed") -eq 1 ]; then
		echo borgbackup already installed
	else
		sudo apt install -y borgbackup
	fi
else
	if [ $(sudo pacman -Qs borg >/dev/null | grep -c "local/borg" ) -eq 0 ]; then
		echo borg already installed
	else
		sudo pacman -S borg
	fi
fi

# # install docker (Debian)
# sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common
# curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
# sudo apt-key fingerprint 0EBFCD88 # should match
# sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
# sudo apt-get update # required?
# sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose

# # install jitsi meet (Debian)
# git clone https://github.com/jitsi/docker-jitsi-meet && cd docker-jitsi-meet
# cp env.example .env
# ./gen-passwords.sh
# mkdir -p ~/.jitsi-meet-cfg/{web/letsencrypt,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri}
# docker-compose up -d

# clone the AO repository
cd ~
if find "ao-react" -mindepth 1 -print -quit 2>/dev/null | grep -q .; then
	echo ao-react git repository already cloned
else
	git clone https://github.com/coalition-of-invisible-colleges/ao-react
fi

# install project dependencies
cd ~/ao-react

if [ $(npm list --depth 0 AutonomousOrganization | grep -c "AutonomousOrganization") -eq 1 ]; then
	echo ao node module already installed
else
	npm install
fi

# create configuration.js
if [ -f "$HOME/ao-react/configuration.js" ]; then
	echo configuration.js already exists
else
	CONFIG="module.exports = {
    bitcoind: {
        network: 'mainnet'
    },
    bitcoinAverage: {
        pub: '',
        secret: ''
    },
    sqlite3: {
        file: '$HOME/.ao/database.sqlite3'
    },
    clightning: {
        dir: '$HOME/.lightning/bitcoin'
    },
    tor: {
    	hostname: '$TORHOSTNAME'
    },
    memes: {
        dir: '$HOME/.ao/memes'
    },
    jitsi: {
    	domain: 'meet.dctrl.ca'
    },
    socketUrl: 'http://localhost:8003' // development
    // socketUrl: null // production
}"
    echo "$CONFIG" > $HOME/ao-react/configuration.js
    echo configuration.js file created
fi

# set up tor to autostart as a daemon via systemd
if [ -f "/etc/systemd/system/tor.service" ]; then
	echo tor systemd startup file already exists
else
	TORUNIT="[Unit]
Description=Anonymizing overlay network for TCP (multi-instance-master)
After=network.target

[Service]
User=$USER
Group=$USER
Type=simple
#Type=forking
PrivateTmp=yes
PermissionsStartOnly=true

ExecStartPre=-/bin/mkdir /var/run/tor
ExecStartPre=/bin/cp $TORRCPATH /var/run/tor
ExecStartPre=/bin/chmod a-wx,go-rwx /var/run/tor/torrc
ExecStartPre=/bin/chown -R $USER:$USER /var/run/tor

ExecStart=/usr/local/bin/tor -f $TORRCPATH
ExecReload=/bin/kill -HUP $MAINPID

#LimitNPROC = 2
#DeviceAllow = /dev/null rw
#DeviceAllow = /dev/urandom r
#DeviceAllow = /dev/random r
#InaccessibleDirectories = /
#ReadOnlyDirectories = /etc /usr
#ReadWriteDirectories = /var/lib/tor /var/log/tor

#PIDFile=/var/run/tor/tor.pid
KillSignal=SIGINT
LimitNOFILE=8192
PrivateDevices=yes

#Type=oneshot
#RemainAfterExit=yes
#ExecStart=/bin/true
#ExecReload=/bin/true

[Install]
WantedBy=multi-user.target"
	echo "$TORUNIT" | sudo tee /etc/systemd/system/tor.service 1>/dev/null 2>&1
	sudo systemctl daemon-reload
	echo tor systemd startup file created
fi

# set up AO to autostart as a daemon via systemd
if [ -f "/etc/systemd/system/ao.service" ]; then
	echo ao systemd startup file already exists
else
	UNIT="[Unit]
Description=ao-daemon

[Service]
ExecStart=$HOME/.nvm/versions/node/v15.2.1/bin/node $HOME/ao-react/src/server/app.js
User=$USER
Type=simple
Restart=always
RestartSec=30
PrivateTmp=true

[Install]
WantedBy=multi-user.target"

	echo "$UNIT" | sudo tee -a /etc/systemd/system/ao.service 1>/dev/null 2>&1
	sudo systemctl daemon-reload
	echo ao systemd startup file created
fi

if [ $(sudo systemctl status tor | grep -c "disabled") -eq 0 ]; then
	echo tor systemd startup already enabled
else
	sudo systemctl enable tor
	echo tor systemd startup enabled
fi

if [ $(sudo systemctl status ao | grep -c "disabled") -eq 0 ]; then
	echo ao systemd startup already enabled
else
	sudo systemctl enable ao
	echo ao systemd startup enabled
fi

# cleanup c-lightning install
cd ~
if [ "$lightning" = true ]; then
	rm -rf lightning
fi

# cleanup tor install
if [ "$tor" = true ]; then
	rm tor-0.4.4.6.tar.gz
fi

echo the AO is installed