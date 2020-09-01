FROM node
COPY package.json .
RUN npm install
COPY app.js .
COPY index.html .
EXPOSE 8000
CMD [ "npm", "start" ]