FROM node
COPY package.json .
RUN npm install
COPY app.js .
COPY keycloak.json .
EXPOSE 3000
CMD [ "npm", "start" ]