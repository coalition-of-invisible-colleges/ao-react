# install dependencies
sudo apt-get update
sudo apt install sqlite3

# install nvm
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
source ~/.profile
nvm install 11

#install yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install --no-install-recommends yarn
yarn cache clean

# install 0MQ
wget https://github.com/zeromq/libzmq/releases/download/v4.3.1/zeromq-4.3.1.tar.gz
tar xf zeromq-4.3.1.tar.gz
cd zeromq-4.3.1
./configure
make
make install

# install c-lightning
# test these to see which are optional. autodev-tools might be optional.
sudo apt install zlib1g-dev libtool autoconf automake autotools-dev libgmp-dev libsqlite3-dev libsodium-dev
git clone https://github.com/ElementsProject/lightning.git
cd lightning
./configure
make
make install

# bitcoin: download a hosted copy of the current bitcoin executable for pi

# install the AO
git clone dctrl.ca
set up config file
yarn install --network-timeout 10000000
yarn compile