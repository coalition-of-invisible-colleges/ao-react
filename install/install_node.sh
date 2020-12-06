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
