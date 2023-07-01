

Syncthing on arkos

Goal: savestate/save sync to other retroarch instances

In Retroarch -> Settings -> Saving: recommend disabling any type of per-game/per-core save settings so everything is in single folders


Identify retroarch save location:

/home/ark/.config/retroarch/saves/
/home/ark/.config/retroarch/states/


ssh into arkos:

ssh ark@<local_ip_addr>
password: ark

syncthing apt install: https://apt.syncthing.net/

.. code-block:: bash
    sudo curl -o /usr/share/keyrings/syncthing-archive-keyring.gpg https://syncthing.net/release-key.gpg
    echo "deb [signed-by=/usr/share/keyrings/syncthing-archive-keyring.gpg] https://apt.syncthing.net/ syncthing stable" | sudo tee /etc/apt/sources.list.d/syncthing.list
    sudo apt update
    sudo apt install syncthing


for first time configuration, update the GUI address to the devices IP:

open config.xml:

``nano ~/.config/syncthing/config.xml``

Update gui/address:


``<address>127.0.0.1:8384</address>`` -> ``<address>LOCAL_IP_ADDRESS:8384</address>``


Start it up: ``syncthing``

from your host machine. login to the gui with LOCAL_IP_ADDRESS:8384

remove the default folder sync and create a new one

name: whatever you want

folder path: ``/home/ark/.config/retroarch``

In ``Ignore Patterns`` check the enable box

everything else on default. Hit save


Now enter the Ignore Patterns:

.. code-block::

    // DO NOT IGNORE
    !/states
    !/saves
    // IGNORE (everything else)
    *

Now you can add a remote device. in this case i have a NAS that acts as the primary remote device. all other devices sync to it

As you share across devices make SURE you add the ignore pattern everywhere!!

best way i found to do it was rg353m -> NAS -> steamdeck


Syncthing auto start

https://docs.syncthing.net/users/autostart.html?highlight=windows#using-systemd

disable syncthing gui now (save some resources) (in ~/.config/syncthing/config.xml)

``<gui enabled="false" tls="false" debugging="false">``

Also checkout https://docs.syncthing.net/users/tuning.html#tuning-for-low-resources

to help minimize resource utilization


systemctl --user enable syncthing.service
systemctl --user start syncthing.service