FROM node:20

WORKDIR upgradehub
RUN apt-get update
RUN git clone https://github.com/SergeKireev/upgradehub-frontend.git

RUN git clone https://github.com/SergeKireev/upgradehub-diamond-scanner.git

WORKDIR upgradehub-frontend
RUN npm i
RUN echo 'REACT_APP_URL=' > .env
RUN npm run build-dev
RUN mkdir -p ../upgradehub-diamond-scanner/web
RUN mv web/dist/* ../upgradehub-diamond-scanner/web
RUN mv web/assets ../upgradehub-diamond-scanner/web
RUN mv web/favicon.ico ../upgradehub-diamond-scanner/web

WORKDIR ../upgradehub-diamond-scanner
RUN npm i
RUN npx tsc
EXPOSE 3000

ENTRYPOINT ["nodejs", "build/app/launch_scan_and_serve.js"]