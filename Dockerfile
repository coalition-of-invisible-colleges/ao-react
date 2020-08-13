FROM node:12.16

RUN apt-get update
RUN apt-get install -y \
  build-essential\
  fakeroot \
  devscripts \
  libevent-dev \
  libssl-dev \
  sqlite3 \
  zlib1g-dev \
  libtool \
  autoconf \
  automake \
  autotools-dev \
  libgmp-dev \
  libsqlite3-dev \
  python3 \
  python3-mako \
  libsodium-dev \
  gettext \
  borgbackup \
  vim

RUN git clone https://github.com/ElementsProject/lightning.git; \
  lightning=true; \
  cd lightning; \
  ./configure; \
  make; \
  make install

RUN wget https://dist.torproject.org/tor-0.4.0.5.tar.gz; \
	tor=true; \
	tar xf tor-0.4.0.5.tar.gz; \
	cd tor-0.4.0.5; \
	./configure; \
	make; \
	make install

ENV EDITOR=vim

RUN mkdir -p /usr/local/etc/tor
ENV TORRCPATH=/usr/local/etc/tor/torrc

RUN wget https://raw.githubusercontent.com/torproject/tor/master/src/config/torrc.sample.in; \
	mv torrc.sample.in $TORRCPATH

RUN echo "HiddenServiceDir /var/lib/tor/ao" | tee -a $TORRCPATH 1>/dev/null 2>&1
RUN echo "HiddenServicePort 80 0.0.0.0:8003" | tee -a $TORRCPATH 1>/dev/null 2>&1

RUN mkdir -p /var/lib/tor/ao

EXPOSE 8003
EXPOSE 3000

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . ./

# RUN npm install

# ENV CONFIG="module.exports = { \
#     bitcoind: { \
#         network: 'mainnet' \
#     }, \
#     bitcoinAverage: { \
#         pub: '', \
#         secret: '' \
#     }, \
#     sqlite3: { \
#         file: 'database.sqlite3' \
#     }, \
#     clightning: { \
#         dir: '$HOME/.lightning/bitcoin' \
#     }, \
#     tor: { \
#     	hostname: '$TORHOSTNAME' \
#     } \
# }"
# RUN echo "$CONFIG" > configuration.js; \
#     echo configuration.js file created
CMD ["bash"]
