# update
sudo apt-get update -qq
echo apt update complete

# install git
if [ $(dpkg-query -W -f='${Status}' git 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo git already installed
else
	sudo apt install git
fi

# install sqlite3
if [ $(dpkg-query -W -f='${Status}' sqlite3 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo sqlite3 already installed
else
	sudo apt install sqlite3
fi

# install nvm
. ~/.nvm/nvm.sh
if [ $(nvm ls | grep -c "\->\s*v11") -eq 1 ];
then
	echo nvm already installed
else
	curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
	source ~/.profile
	nvm install 11
fi

#install yarn
if [ $(yarn --version | grep -c "1.17.3") -eq 1 ];
then
	echo yarn already installed
else
	cd ~
	curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
	echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
	sudo apt-get update && sudo apt-get install -y --no-install-recommends yarn
	yarn cache clean
fi

# install 0MQ
cd ~
if [ ! -d "zeromq-4.3.1" ];
then
	wget -q https://github.com/zeromq/libzmq/releases/download/v4.3.1/zeromq-4.3.1.tar.gz
	tar xf zeromq-4.3.1.tar.gz
fi
cd zeromq-4.3.1
if [ $(./version.sh | grep -c "4.3.1") -eq 1 ];
then
	echo zeromq already installed
else
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
	sudo apt install zlib1g-dev
fi

if [ $(dpkg-query -W -f='${Status}' libtool 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo libtool already installed
else
	sudo apt install libtool
fi

if [ $(dpkg-query -W -f='${Status}' autoconf 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo autoconf already installed
else
	sudo apt install autoconf
fi

if [ $(dpkg-query -W -f='${Status}' automake 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo automake already installed
else
	sudo apt install automake
fi

if [ $(dpkg-query -W -f='${Status}' autotools-dev 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo autotools-dev already installed
else
	sudo apt install autotools-dev
fi

if [ $(dpkg-query -W -f='${Status}' libgmp-dev 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo libgmp-dev already installed
else
	sudo apt install libgmp-dev
fi

if [ $(dpkg-query -W -f='${Status}' libsqlite3-dev 2>/dev/null | grep -c "ok installed") -eq 1 ];
then
	echo libsqlite3-dev already installed
else
	sudo apt install libsqlite3-dev
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
	sudo apt install python3
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
	sudo apt install libsodium-dev
fi

if [ $(lightning-cli --version | grep -c "v0.7.2") -eq 1 ];
then
	echo c-lightning already installed
else
	cd ~
	git clone https://github.com/ElementsProject/lightning.git
	cd lightning
	./configure
	make
	sudo make install
fi

# bitcoin: download a hosted copy of the current bitcoin executable for pi

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

echo the AO is installed
echo -e \\nnow you must set up the configuration file in ~/ao/configuration.js
echo then, simply type \'cd ao\' then \'yarn compile\' to compile and start the AO server
echo see README.md and pi_readme.md for further installation help

# cleanup