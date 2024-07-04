## Getting Started

Copy the inventory example file:

```bash
$ cp hosts.ini.example hosts.ini
```

Update the `<host1>` with your server's IP address:

```bash
$ vim hosts.ini
```

Run the playbook:

```bash
$ ansible-playbook -i hosts.ini playbook.yml
```

## Credits

Config adapted from https://github.com/guillaumebriday/kamal-ansible-manager.
