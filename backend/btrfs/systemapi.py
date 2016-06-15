# -*- coding: utf-8 -*-
# kate: space-indent on; indent-width 4; replace-tabs on;

"""
 *  Copyright (C) 2011-2016, it-novum GmbH <community@openattic.org>
 *
 *  openATTIC is free software; you can redistribute it and/or modify it
 *  under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; version 2.
 *
 *  This package is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
"""

import os
from systemd.procutils import invoke
from systemd.plugins import logged, BasePlugin, deferredmethod


@logged
class SystemD(BasePlugin):
    dbus_path = "/btrfs"

    @deferredmethod(in_signature="s")
    def format(self, devpath, sender):
        invoke(["mkfs.btrfs", devpath])

    @deferredmethod(in_signature="s")
    def create_subvolume(self, path, sender):
        invoke(["btrfs", "subvolume", "create", path])

    @deferredmethod(in_signature="ssb")
    def create_snapshot(self, origpath, snappath, readonly, sender):
        if not os.path.exists(os.path.dirname(snappath)):
            os.makedirs(os.path.dirname(snappath))
        cmd = ["btrfs", "subvolume", "snapshot"]
        if readonly:
            cmd.append("-r")
        cmd.extend([origpath, snappath])
        invoke(cmd)

    @deferredmethod(in_signature="s")
    def delete_subvolume(self, path, sender):
        invoke(["btrfs", "subvolume", "delete", path])

    @deferredmethod(in_signature='si')
    def btrfs_resize(self, devpath, newmegs, sender):
        invoke(['btrfs', 'filesystem', 'resize', ("%dM" % newmegs), devpath])
