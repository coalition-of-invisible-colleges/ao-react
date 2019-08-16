# update
sudo apt update -yqq
echo apt update complete

# upgrade
sudo apt upgrade -yqq
echo apt upgrade complete

# install git
if [ $(dpkg-query -W -f='${Status}' git 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo git already installed
else
	sudo apt install -y git
fi

# install sqlite3
if [ $(dpkg-query -W -f='${Status}' sqlite3 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo sqlite3 already installed
else
	sudo apt install -y sqlite3
fi

# install nvm
. ~/.nvm/nvm.sh
if [ $(nvm ls | grep -c "\->\s*v11") -eq 1 ];
then
	echo nvm v11 already installed
else
	curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
	source ~/.profile
	nvm install 11
fi

#install yarn
if [ $(yarn --version | grep -c "1.17.3") -eq 1 ];
then
	echo yarn v1.17.3 already installed
else
	cd ~
	curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
	echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
	sudo apt-get update && sudo apt-get install -y --no-install-recommends yarn
	yarn cache clean
fi

# install 0MQ
cd ~
MAJOR=`egrep '^#define +ZMQ_VERSION_MAJOR +[0-9]+$' include/zmq.h`
MINOR=`egrep '^#define +ZMQ_VERSION_MINOR +[0-9]+$' include/zmq.h`
PATCH=`egrep '^#define +ZMQ_VERSION_PATCH +[0-9]+$' include/zmq.h`
if [ ! ( -z "$MAJOR" -o -z "$MINOR" -o -z "$PATCH" ) ]; then
    echo zeromq install appears corrupted
elif [ -f include/zmq.h ];
	echo zeromq v$MAJOR.$MINOR.$PATCH already installed
then
	wget -q https://github.com/zeromq/libzmq/releases/download/v4.3.1/zeromq-4.3.1.tar.gz
	tar xf zeromq-4.3.1.tar.gz
	zeromq=true
	cd zeromq-4.3.1
	./configure
	make
	make install
fi

# install c-lightning
# test these to see which are optional. autodev-tools might be optional.
if [ $(dpkg-query -W -f='${Status}' zlib1g-dev 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo zlib1g-dev already installed
else
	sudo apt install -y zlib1g-dev
fi

if [ $(dpkg-query -W -f='${Status}' libtool 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo libtool already installed
else
	sudo apt install -y libtool
fi

if [ $(dpkg-query -W -f='${Status}' autoconf 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo autoconf already installed
else
	sudo apt install -y autoconf
fi

if [ $(dpkg-query -W -f='${Status}' automake 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo automake already installed
else
	sudo apt install -y automake
fi

if [ $(dpkg-query -W -f='${Status}' autotools-dev 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo autotools-dev already installed
else
	sudo apt install -y autotools-dev
fi

if [ $(dpkg-query -W -f='${Status}' libgmp-dev 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo libgmp-dev already installed
else
	sudo apt install -y libgmp-dev
fi

if [ $(dpkg-query -W -f='${Status}' libsqlite3-dev 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo libsqlite3-dev already installed
else
	sudo apt install -y libsqlite3-dev
fi

if [ $(dpkg-query -W -f='${Status}' python 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo python already installed
else
	sudo apt install -y python
fi

if [ $(dpkg-query -W -f='${Status}' python3 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo python3 already installed
else
	sudo apt install -y python3
fi

if [ $(dpkg-query -W -f='${Status}' python3-mako 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo python3-mako already installed
else
	sudo apt install -y python3-mako
fi

if [ $(dpkg-query -W -f='${Status}' libsodium-dev 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo libsodium-dev already installed
else
	sudo apt install -y libsodium-dev
fi

if [ $(lightning-cli --version | grep -c "v0.7.2") -eq 1 ];
then
	echo c-lightning v0.7.2 already installed
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
if [ $(dpkg-query -W -f='${Status}' tor 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo tor already installed
else
	sudo apt install -y tor
fi

cd ~
if [ ! -d ".tor" ];
then
	mkdir .tor
fi

if [ ! $(stat -c "%a" ".tor") == "700" ];
then
	chmod 700 .tor
fi

if [ $(cat /etc/tor/torrc | grep -c "HiddenServiceDir /home/$USER/.tor") -eq 0 ];
then
	echo "HiddenServiceDir /home/$USER/.tor" | sudo tee -a /etc/tor/torrc
fi

if [ $(cat /etc/tor/torrc | grep -c "HiddenServicePort 80 127.0.0.1:8003") -eq 0 ];
then
	echo "HiddenServicePort 80 127.0.0.1:8003" | sudo tee -a /etc/tor/torrc
fi

# clone the AO repository
cd ~
if find "ao" -mindepth 1 -print -quit 2>/dev/null | grep -q .;
then
	echo ao git repository already cloned
else
	git clone https://github.com/autonomousorganization/ao
fi

# install project dependencies
cd ao
if [ $(yarn check --integrity | grep -c "success") -eq 1 ];
then
	echo 'yarn install' already complete
else
	yarn install --network-timeout 10000000
fi

# cleanup zeromq install
cd ~
if [ "$zeromq" = true ];
then
	rm -f zeromq-4.3.1.tar.gz
	rm -rf zeromq-4.3-1
fi

# cleanup c-lightning install
if [ "$lightning" = true ];
then
	rm -rf lightning
fi

echo the AO is installed