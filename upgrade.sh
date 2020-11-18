# Updates the AO to the newest version
# To run, first `chmod u+x upgrade.sh` then `./upgrade.sh`

# Todo: Add an switch to create the swap file automatically

# On low memory systems, linking fails without this
export NODE_OPTIONS=--max-old-space-size=8192

# Pull the newest version of the AO
git pull

# Compile
npm run webpack