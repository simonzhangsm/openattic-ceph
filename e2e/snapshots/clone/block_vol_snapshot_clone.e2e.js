var helpers = require('../../common.js');

describe('should create a clone volume of a snapshot (base: blockvolume)', function(){

  var volumename = 'protractor_blockvol';
  var volume = element(by.cssContainingText('tr', volumename));

  var snapshotname = 'protractor_test_snap';
  var snapshot = element.all(by.cssContainingText('tr', snapshotname)).get(0);

  var clonename ="protractor_block_clone";
  var clone = element.all(by.cssContainingText('tr', clonename)).get(0);

  var snapMenuBtn = element.all(by.css('.tc_menudropdown')).get(1);
  var volumesItem = element.all(by.css('ul .tc_menuitem')).get(3);

  beforeAll(function(){
    helpers.login();
    volumesItem.click();
    helpers.create_volume(volumename, "lun");
    helpers.create_snapshot(volume);
    volume.click();
    element(by.css('.tc_snapshotTab')).click();

  });

  it('should not allow spaces or additional characters', function(){
    expect(volume.isDisplayed()).toBe(true);
    expect(snapshot.isDisplayed()).toBe(true);
    snapshot.click();
    browser.sleep(400);
    snapMenuBtn.click();
    browser.sleep(400);
    element(by.css('.tc_snap_clone')).click();
    browser.sleep(400);
    var test = "öasdf 123";
    element(by.model('clone_obj.name')).sendKeys(test);
    browser.sleep(400);
    expect(element(by.css('.tc_cloneNoValidName')).isDisplayed()).toBe(true);
    element(by.id('bot1-Msg1')).click();
    expect(element(by.css('.tc_oadatatable_snapshots')).isPresent()).toBe(true);
  });

  it('should create a clone of the created snapshot', function(){
    expect(volume.isDisplayed()).toBe(true);
    expect(snapshot.isDisplayed()).toBe(true);

    snapMenuBtn.click();
    browser.sleep(400);
    element(by.css('.tc_snap_clone')).click();
    browser.sleep(400);
    element(by.model('clone_obj.name')).sendKeys(clonename);
    element(by.id('bot2-Msg1')).click();
    browser.sleep(800);
  });

  it('should display the clone in the volumes list', function(){
    browser.sleep(600);
    expect(clone.isDisplayed()).toBe(true);
  });

  it('should delete the clone volume', function(){
    expect(clone.isDisplayed()).toBe(true);
    clone.click();
    browser.sleep(400);
    element.all(by.css('.tc_menudropdown')).get(0).click();
    browser.sleep(400);
    element(by.css('.tc_deleteItem')).click();
    browser.sleep(400);

    element(by.model('input.enteredName')).sendKeys(clonename);
    element(by.id('bot2-Msg1')).click();
  });

  afterAll(function(){
    console.log('block_vol_snapshot_clone');
    helpers.delete_snapshot(volume);
    helpers.delete_volume(volume, volumename);

  });
});
