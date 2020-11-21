# Updates the AO to the newest version
# To run, first `chmod u+x upgrade.sh` then `./upgrade.sh`
# Automatically shuts down your jitsi server first to speed up compiling
# Does `npm install` first to make sure that build succeeds

# Todo: Add an switch to create the swap file automatically

if [ -d "$HOME/docker-jitsi-meet" ]; then
	cd ~/docker-jitsi-meet
	docker-compose down
	cd -
fi

# On low memory systems, linking fails without this
export NODE_OPTIONS=--max-old-space-size=8192

# Pull the newest version of the AO
git pull

# Install
npm install

# Compile
npm run webpack

if [ -d "$HOME/docker-jitsi-meet" ]; then
	cd ~/docker-jitsi-meet
	docker-compose up -d
	cd -
fi