## MongoDB setup

Start Mongo via Docker

```bash
docker run --name my-mongo -dit -p 27017:27017 --rm mongo:4.4.1
```

To run MongoDB commands in the terminal

```bash
docker exec -it my-mongo mongo
```

For MongoDB GUI use [Compass](<[https://mongodb.prakticum-team.ru/download-center/compass](https://mongodb.prakticum-team.ru/download-center/compass)>)


To stop MongoDB container

```bash
docker stop my-mongo
```