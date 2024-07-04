## Getting Started

Copy the inventory example file:

```bash
$ cp hosts.ini.example hosts.ini
```

Update the `<host1>` with your server's IP address:

```bash
$ vim hosts.ini
```

Copy the vars example file:

```bash
$ cp vars.yml.example vars.yml
```

Update the values to your needs:

```bash
$ vim vars.yml
```

Run the playbook:

```bash
$ ansible-playbook -i hosts.ini -e @vars.yml playbook.yml
```

## Credits

Config adapted from https://github.com/guillaumebriday/kamal-ansible-manager.
