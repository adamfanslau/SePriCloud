###Before building the docker image, modify `kickstart.json`, adding:admin/user credentials:
```json
  "variables": {
    ...
    "adminEmail": "<ADD ADMIN EMAIL HERE>",
    "adminPassword": "<ADD ADMIN PASSWORD HERE>",
    ...
    "userEmail": "<ADD USER EMAIL HERE>",
    "userPassword": "<ADD USER PASSWORD> HERE",
    ...
},
```