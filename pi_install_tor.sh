if [ $(tor --version | grep -c "0\.4\.0\.5") -eq 1 ];
then
	echo tor v0.4.0.5 already installed
else
	if [ $(cat /etc/apt/sources.list | grep -c "deb https://deb.torproject.org/torproject.org stretch main") -eq 0 ];
	then
		sudo echo "deb https://deb.torproject.org/torproject.org stretch main" >> /etc/apt/sources.list
	fi

	if [ $(cat /etc/apt/sources.list | grep -c "deb-src https://deb.torproject.org/torproject.org stretch main") -eq 0 ];
	then
		sudo echo "deb-src https://deb.torproject.org/torproject.org stretch main" >> /etc/apt/sources.list
	fi
	
	sudo curl https://deb.torproject.org/torproject.org/A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89.asc | gpg --import
	sudo gpg --export A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 | apt-key add -

	if [ $(dpkg-query -W -f='${Status}' build-essential 2>/dev/null | grep -c "ok installed") -eq 0 ];
	then
		sudo apt install -y build-essential
	fi

	if [ $(dpkg-query -W -f='${Status}' fakeroot 2>/dev/null | grep -c "ok installed") -eq 0 ];
	then
		sudo apt install -y fakeroot
	fi

	if [ $(dpkg-query -W -f='${Status}' devscripts 2>/dev/null | grep -c "ok installed") -eq 0 ];
	then
		sudo apt install -y devscripts
	fi

	sudo apt build-dep tor deb.torproject.org-keyring
	apt source tor
	cd tor-*
	debuild -rfakeroot -uc -us
	cd ..
	sudo dpkg -i tor_*.deb
fi