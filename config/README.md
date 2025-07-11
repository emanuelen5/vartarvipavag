This little readme instructs you how to set up your home assistant to proxy to the application.

1. Install and configure SSL (I've used Duckdns which is easy) with the *NGINX Home Assistant SSL proxy* addon
1. Add the following settings to *Customize* to make NGINX read additional configuration files:
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
