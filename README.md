# GeekMagicTV
Control the display in your GeekMagic TV, without firmware changes

# What it does

This script updates an image, or images, onto the GeekMagic hardware every minute to give the impression of a dynamic update screen. (Despite all image creation being done on a host machine, and uploaded via an unprotected HTTP request.)


# Usage

Standard Node stuff,

```
npm install
npm run main
```

Configuration is via the .env.sample file

# Backup

To preserve the settings, fwiw, can be done with
```
npm run backup
```
Preserving the existing images is a TODO


# TODO

Some random ideas:

* Full train departures
* OS module to support multiple machines
* OS module extended to report specific server functions
* Picture gallery and/or image of the day
* Email alerts
* Calendar details
* Other minerva things

