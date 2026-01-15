# Moodle custom plugin demo

Start Moodle using docker compose:

```shell
docker compose up
```

Create the plugin zip file

```shell
zip -r assignmentbutton.zip assignmentbutton/
```

Navigate to Moodle in browser and login

Manually install the plugin zip package:

`Site Administration` > `Plugins` > `Install Plugins` > `Upload plugin zipfile` > `Confirm plugin install`

Verify plugin is now visible at:

`Site Administration` > `Plugins` > `Plugins Overview`