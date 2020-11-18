# partly-finished script to install everything you need to host Jitsi Meet in the AO

git clone https://github.com/jitsi/docker-jitsi-meet
cd docker-jitsi-meet
cp env.example .env

# now edit the .env file, setting ports to 81 and 444, and ip to your external ip based on ip addr second block

./gen-passwords.sh
mkdir -p ~/.jitsi-meet-cfg/{web/letsencrypt,transcripts,prosody/config,prosody/prosody-plugins-custom,jicofo,jvb,jigasi,jibri}

# install snapd

sudo apt install snapd

# update snapd
sudo snap install core; sudo snap refresh core

# clean prior certbot installs

sudo apt-get remove certbot, sudo dnf remove certbot, or sudo yum remove certbot

# install certbot

sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# get certificate

sudo certbot certonly --nginx # add -d domain to force new cert

# now set up the nginx sites-available file, ln -s it into sites-enabled, and then restart nginx

# uninstall old docker versions
sudo apt-get remove docker docker-engine docker.io containerd runc

# add docker repos

sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common

# add docker gpg key

curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -

sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"

# install docker

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose

# set permissions for docker-compose. need to log out and in after this maybe
sudo usermod -aG docker ${USER}

# finally

docker-compose up -d