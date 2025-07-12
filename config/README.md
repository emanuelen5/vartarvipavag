## NGINX configuration

This little readme instructs you how to set up your home assistant to proxy to the application.

1. Install and configure SSL (I've used Duckdns which is easy) with the [(core) *NGINX Home Assistant SSL proxy*](https://github.com/home-assistant/addons/tree/master/nginx_proxy) addon
1. Add the following value to the *Customize* setting (in the Configuration tab in Homeassistant) to make NGINX read additional configuration files:
    ```yaml
    active: true
    default: nginx_proxy_default*.conf
    servers: nginx_proxy/*.conf
    ```
1. Copy the /config/nginx.conf file from this repo to your Homeassistant /share directory. E.g. in my case I have it set up with docker, so I placed it in `/usr/share/hassio/share`
1. Update the IP address. It might differ from the 172.17.0.1 as in the
   `proxy_pass` line in nginx.conf.

> [!TIP]
> Run
>
> ```console
> $ ip addr show docker0
> 5: docker0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default
>     link/ether 02:42:ed:57:6c:e3 brd ff:ff:ff:ff:ff:ff
>     inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
>        valid_lft forever preferred_lft forever
>     inet6 fe80::42:edff:fe57:6ce3/64 scope link
>        valid_lft forever preferred_lft forever
> ```
> to figure out the host IP address.

## Homeassistant configuration

Then we need to configure Homeassistant to push the current location to the web service at a fixed time interval.

### status updater

Add a [*RESTful command*](https://www.home-assistant.io/integrations/rest_command/) service that pushes your current position to your app (using local network):

```yaml
rest_command:
    vartarvipavag_update:
        url: 'http://172.17.0.1:3001/position'
        method: "POST"
        content_type: "application/json"
        payload: >
            {
                "latitude": "{{ state_attr('device_tracker.<device>', 'latitude') }}",
                "longitude": "{{ state_attr('device_tracker.<device>', 'longitude') }}",
                "timestamp": "{{ now().isoformat() }}"
            }
```

> [!NOTE]
> Change `<device>` for the name of your device. Also, the IP above should be the same as you set in the NGINX configuration.

### automation

then add the following automation

```yaml
alias: Interrail Position Tracker
description: ""
trigger:
  - platform: time_pattern
    hours: "*"  # every hour at XX:00:00
condition: []
action:
  - service: rest_command.vartarvipavag_update
    data: {}
mode: single
```
