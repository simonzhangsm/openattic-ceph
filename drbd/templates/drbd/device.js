/*
 Copyright (C) 2011-2012, it-novum GmbH <community@open-attic.org>

 openATTIC is free software; you can redistribute it and/or modify it
 under the terms of the GNU General Public License as published by
 the Free Software Foundation; version 2.

 This package is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
*/

Ext.namespace("Ext.oa");

Ext.define('Ext.oa.Drbd__Connection_Panel', {
  alias: 'widget.drbd__connection_panel',
  extend: 'Ext.oa.ShareGridPanel',
  api: drbd__Connection,
  id: "drbd__connection_panel_inst",
  title: gettext("Datenspiegelung"),
  texts: {
    add:     gettext('Add Connection'),
    edit:    gettext('Edit Connection'),
    remove:  gettext('Delete Connection')
  },
  allowEdit: false,
  store: {
    fields: [{
      name: 'dstate_self',
      mapping: 'dstate',
      convert: function(val, row){
        var hostname;
        if( val ){
          for( hostname in val ){
            if( val.hasOwnProperty(hostname) && val[hostname] !== "UpToDate" ){
              return gettext("Bad");
            }
          }
          return gettext("OK");
        }
        return gettext('Unknown');
      }
    }, {
      name: 'role_self',
      mapping: 'role',
      convert: function(val, row){
        var hostname, prims = [];
        if( val ){
          for( hostname in val ){
            if( val.hasOwnProperty(hostname) && val[hostname] === "Primary" ){
              prims.push(hostname);
            }
          }
          return prims.join(', ');
        }
        return gettext('Unknown');
      }
    }]
  },
  columns: [{
    header: gettext('Resource Name'),
    dataIndex: "res_name"
  }, {
    header: gettext('Protocol'),
    dataIndex: "protocol"
  }, {
    header: gettext('Disk state (overall)'),
    dataIndex: "dstate_self"
  }, {
    header: gettext('Connection state'),
    dataIndex: "cstate"
  }, {
    header: gettext('Primary'),
    dataIndex: "role_self"
  }],
  window: {
    height: 600,
    width:  700
  },
  form: {
    items: [{
      xtype: 'fieldset',
      title: gettext('Connection settings'),
      layout: 'form',
      items: [ {
        xtype: "textfield",
        name:  "res_name",
        fieldLabel: gettext('Resource name')
      }, {
        xtype: 'radiogroup',
        fieldLabel: 'Protocol',
        columns: 1,
        items: [
          {name: "protocol", boxLabel: gettext('A: Asynchronous'), inputValue: "A"},
          {name: "protocol", boxLabel: gettext('B: Memory Synchronous (Semi-Synchronous)'), inputValue: "B"},
          {name: "protocol", boxLabel: gettext('C: Synchronous'), checked: true, inputValue: "C"}
        ]
      }, {
        xtype:      'combo',
        fieldLabel: gettext('Address'),
        ref:        'addrfield',
        allowBlank: true,
        name: 'ipaddress',
        store: (function(){
          Ext.define('drbd_addrfield_model', {
            extend: 'Ext.data.Model',
            fields: ["app", "obj", "id", "address"]
          });
          return Ext.create('Ext.data.Store', {
            model: "drbd_addrfield_model",
            proxy: {
              type: 'direct',
              directFn: ifconfig__IPAddress.ids
            },
            autoLoad: true
          });
        }()),
        typeAhead:     true,
        triggerAction: 'all',
        emptyText:     gettext('Select...'),
        deferEmptyText: false,
        selectOnFocus: true,
        displayField:  'address',
        valueField:    'id'
      }, {
        xtype:      'combo',
        fieldLabel: gettext('Parent connection'),
        ref:        'parentfield',
        allowBlank: true,
        name: 'stack_parent',
        store: (function(){
          Ext.define('drbd_parentfield_model', {
            extend: 'Ext.data.Model',
            fields: ["app", "obj", "id", "__unicode__"]
          });
          return Ext.create('Ext.data.Store', {
            model: "drbd_parentfield_model",
            proxy: {
              type: 'direct',
              directFn: drbd__Connection.ids_filter,
              extraParams: {kwds: {stack_parent__isnull: true}}
            },
            autoLoad: true
          });
        }()),
        typeAhead:     true,
        triggerAction: 'all',
        emptyText:     gettext('Select...'),
        deferEmptyText: false,
        selectOnFocus: true,
        displayField:  '__unicode__',
        valueField:    'id'
      }, {
        fieldLabel: gettext('Syncer Rate'),
        name: "syncer_rate",
        xtype: 'textfield',
        value: "5M"
      }, {
        fieldLabel: gettext('Secret'),
        name: "secret",
        xtype: 'textfield'
      }, {
        fieldLabel: gettext('Timeout'),
        name: "wfc_timeout",
        xtype: 'numberfield',
        value: 10
      }, {
        fieldLabel: gettext('Timeout when degraded'),
        name: "degr_wfc_timeout",
        xtype: 'numberfield',
        value: 120
      }, {
        fieldLabel: gettext('Timeout when outdated'),
        name: "outdated_wfc_timeout",
        xtype: 'numberfield',
        value: 15
      }, {
        xtype: 'radiogroup',
        fieldLabel: 'Authentication algorithm',
        columns: 1,
        items: [
          {name: "cram_hmac_alg", boxLabel: "SHA1",   inputValue: "sha1", checked: true},
          {name: "cram_hmac_alg", boxLabel: "MD5",    inputValue: "md5"    },
          {name: "cram_hmac_alg", boxLabel: "CRC32C", inputValue: "crc32c" }
        ]
      } ]
    }, {
      xtype: 'fieldset',
      title: 'Error handling',
      layout: 'form',
      items: [ {
        fieldLabel: gettext('On I/O Error'),
        xtype: 'radiogroup',
        columns: 1,
        items: [ {
          name: "on_io_error", inputValue: "pass_on", checked: true,
          boxLabel: gettext('Report the I/O error to the file system on the primary, ignore it on the secondary.')
        }, {
          name: "on_io_error", inputValue: "call-local-io-error",
          boxLabel: gettext('Call the local-io-error handler script.')
        }, {
          name: "on_io_error", inputValue: "detach",
          boxLabel: gettext('Detach and continue in diskless mode.')
        } ]
      }, {
        fieldLabel: gettext('Fencing'),
        xtype: 'radiogroup',
        columns: 1,
        items: [ {
          name: "fencing", inputValue: "dont-care", checked: true,
          boxLabel: gettext('No fencing actions are undertaken.')
        }, {
          name: "fencing", inputValue: "resource-only",
          boxLabel: gettext('Call the fence-peer handler.')
        }, {
          name: "fencing", inputValue: "resource-and-stonith",
          boxLabel: gettext('Call the fence-peer handler, which outdates or STONITHes the peer.')
        } ]
      } ]
    }, {
      xtype: 'fieldset',
      title: 'Split Brain recovery',
      layout: 'form',
      items: [{
        fieldLabel: gettext('No Primaries'),
        xtype: 'radiogroup',
        columns: 1,
        items: [ {
          name: "sb_0pri", inputValue: "disconnect",
          boxLabel: gettext('Simply disconnect without resynchronization.')
        }, {
          name: "sb_0pri", inputValue: "discard-younger-primary", checked: true,
          boxLabel: gettext('Discard the younger Primary and sync from the host who was primary before.')
        }, {
          name: "sb_0pri", inputValue: "discard-older-primary",
          boxLabel: gettext('Discard the older Primary and sync from the host who last became primary.')
        }, {
          name: "sb_0pri", inputValue: "discard-zero-changes",
          boxLabel: gettext('Discard the node who has not written any changes. If both have changes, disconnect.')
        }, {
          name: "sb_0pri", inputValue: "discard-least-changes",
          boxLabel: gettext('Discard the node with the least changes and sync from the one with most.')
        } ]
      }, {
        fieldLabel: gettext('One Primary'),
        xtype: 'radiogroup',
        columns: 1,
        items: [ {
          name: "sb_1pri", inputValue: "disconnect",
          boxLabel: gettext('Simply disconnect without resynchronization.')
        }, {
          name: "sb_1pri", inputValue: "consensus", checked: true,
          boxLabel: gettext('Discard secondary if it would have also been discarded without any primaries, else disconnect.')
        }, {
          name: "sb_1pri", inputValue: "violently-as0p",
          boxLabel: gettext('Do what we would do if there were no primaries, even if we risk corrupting data.')
        }, {
          name: "sb_1pri", inputValue: "discard-secondary",
          boxLabel: gettext('Discard the secondarys data.')
        }, {
          name: "sb_1pri", inputValue: "call-pri-lost-after-sb",
          boxLabel: gettext('If the current secondary has the right data, call the pri-lost-after-sb handler on the primary.')
        } ]
      }, {
        fieldLabel: gettext('Two Primaries'),
        xtype: 'radiogroup',
        columns: 1,
        items: [ {
          name: "sb_2pri", inputValue: "disconnect", checked: true,
          boxLabel: gettext('Simply disconnect without resynchronization.')
        }, {
          name: "sb_2pri", inputValue: "violently-as0p",
          boxLabel: gettext('Do what we would do if there were no primaries, even if we risk corrupting data.')
        }, {
          name: "sb_2pri", inputValue: "call-pri-lost-after-sb",
          boxLabel: gettext('If the current secondary has the right data, call the pri-lost-after-sb handler on the primary.')
        } ]
      }]
    }]
  }
});


Ext.define('Ext.oa.Drbd_Panel', {
  extend: 'Ext.Panel',
  alias: 'widget.drbd_panel',
  initComponent: function(){
    Ext.apply(this, Ext.apply(this.initialConfig, {
      id: "drbd_panel_inst",
      layout: "border",
      items: [{
        xtype: "drbd__connection_panel",
        region: "center",
        ref: "connpanel"
      }, {
        xtype: "grid",
        id: "drbd_host_panel_inst",
        ref: "hostpanel",
        split: true,
        region: "south",
        height: (Ext.core.Element.getViewHeight() - 100) / 2,
        forceFit: true,
        store: new Ext.data.JsonStore({
          id: "drbd_hoststate",
          fields: ["hostname", "backingdev", "dstate", "role", "connection_id"],
          listeners: {
            add: function(store){
              var parent = iscsiPanel.targets.getSelectionModel();
              var parentid = parent.selected.items[0];
              storeUpdate(tgt_allow, parentid.data.id, "tgt_allow");
            },
            remove: function(store){
              var parent = iscsiPanel.targets.getSelectionModel();
              var parentid = parent.selected.items[0];
              storeUpdate(tgt_allow, parentid.data.id, "tgt_allow");
            }
          }
        }),
        columns: [{
          header: "Host",
          dataIndex: "hostname"
        }, {
          header: "Backing Device",
          dataIndex: "backingdev"
        }, {
          header: "Disk State",
          dataIndex: "dstate"
        }, {
          header: "Role",
          dataIndex: "role"
        }]
      }]
    }));
    this.callParent(arguments);
  },
  onRender: function(){
    // Hijack the grid's buttons
    var self = this;
    this.buttons = this.items.items[0].buttons;
    this.items.items[0].buttons = [];
    Ext.oa.Drbd_Panel.superclass.onRender.apply(this, arguments);
    var load_host_data = function(record){
      var hostname, hostinfo, i,
          hoststuff = [];
      for( hostname in record.json.role ){
        if( record.json.role.hasOwnProperty(hostname) ){
          hostinfo = {
            connection_id: record.json.id,
            hostname: hostname,
            dstate: record.json.dstate[hostname],
            role: record.json.role[hostname]
          }
          if( record.json.endpoint_set[hostname] ){
            hostinfo.backingdev = gettext("Volume") + " " + toUnicode(record.json.endpoint_set[hostname].volume);
          }
          else{
            hostinfo.backingdev = "";
            for( i = 0; i < record.json.stack_child_set.length; i++ ){
              if( record.json.stack_child_set[i].endpoint_hosts.indexOf(hostname) !== -1 ){
                hostinfo.backingdev = gettext("Connection") + " " + toUnicode(record.json.stack_child_set[i]);
              }
            }
          }
          hoststuff.push(hostinfo);
        }
      }
      self.items.items[1].getStore().loadData(hoststuff);
    };
    this.items.items[0].on("cellclick", function(grid, rowIndex, colIndex, evt){
      load_host_data( grid.getStore().getAt(rowIndex) );
    }, this);
    this.items.items[0].getStore().on("load", function(){
      var sm = self.items.items[0].getSelectionModel();
      if( sm.hasSelection() ){
        load_host_data( sm.selected.items[0] );
      }
    }, this);
  }
});


Ext.oa.Drbd__Connection_Module = {
  panel: "drbd_panel",
  prepareMenuTree: function(tree){;
    tree.appendToRootNodeById("menu_services", {
      text: gettext('Datenspiegelung'),
      leaf: true,
      icon: MEDIA_URL + '/icons2/22x22/apps/gnome-session.png',
      panel: "drbd_panel_inst",
      href: '#'
    });
  }
};


window.MainViewModules.push( Ext.oa.Drbd__Connection_Module );

// kate: space-indent on; indent-width 2; replace-tabs on;
