# This script uses `pssh` (parellel ssh) to ssh to a list of remote servers.
# It uses `screen` to create a persistent session.
# Then, it intelligently updates the AO:
# 	resumes the previous ao screen if it exists
# 	(using a named screen, see https://unix.stackexchange.com/questions/12227/setting-a-name-for-a-screen-session)
# 	kills any running process (e.g., previous compile attempt)
# 	pauses Jitsi server if running
# 	pulls for changes
#	if a switch is set, installs a certain version of node
# 	if a switch is set, runs npm i to reinstall packages
# 	recompiles the AO
# 	if a switch is set, restarts the AO (requires password)
# 	if jitsi was stopped, restarts jitsi
#	reports out whether each step worked or not
# Assumptions for the script to work:
# 	pssh is installed in this computer
# 	your remote servers are each listed in ~/.ssh/config with a User and IdentityFile
# 	This script is correctly configured with a list of your user@hostname:port information
# 	On each remote computer:
# 		ssh access is set up using your ssh key
# 		the AO is correctly installed and configured
# 		screen is installed
# 		the AO is set up to run as a user service called ao.service
#		(see https://unix.stackexchange.com/questions/399388/service-functions-without-sudo)
# 		(or https://askubuntu.com/questions/965420/how-can-i-start-stop-as-a-service-as-a-normal-user-without-sudo)