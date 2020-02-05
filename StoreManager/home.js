//shared (all)
var test_mode_enabled = typeof(init_app) === "undefined";
var page_delimiter = "-page_";

var hwid_options = {
  gpu:{
    uuid:true,
    serial_number:true
  },
  smbios:{
    sys_uuid:true,
    board_sn:false,
    enclosure_serials:false,
    processor_id:true,
    ram_serials:false,
    ram_asset_tag:true,
    bios_vendor:false
  },
  drive:{
    serials:true,
    nvme_serials:false,
    product_id:true,
    ssd:true,
    nvme:true,
    usb:false
  },
  partitions:{
    disk_id:true,
    unique_id:false,
    uuid:true,
    only_os_drive:false
  },
  etc:{
    arp_table:true,
    boot_uuid:true,
    pc_sid:true,
    user_sid:false,
    device_name:false
  }

};

var security_cfg = {
  anti_virtual_machine:{
    timing:true,
    detect_hypervisor:true
  },
  integrity:{
    Code:true,
    ReadOnly_Data:true,
    PE_Headers:true
  },
  anti_debug:{
    hardware_breakpoints:true,
    memory_breakpoints:true,
    generic_anti_debug:true,
    Titan_Hide:true,
    x64_dbg:true,
    detect_debug_mode:true,
    detect_testsigning:true
  },
  heartbeat:{
    default:false,
    application_integrity:false,
    anti_debug:false
  }

};

//shared (store/apps)
var access_keys_target = null;

//users
var current_users_pg = 1;
var srch_users = null;
var g_user_id = null;

//users -- bans

var ban__selected_users = [];
var ban__selected_devices = [];


//licenses
var licenses_block_search_deletion = false;
var g_license_key = null;
var manage_licenses = [];
var current_licenses_pg = 1;
var srch_licenses = null;

//devices
var devices_block_search_deletion = false;
var srch_devices = null;
var current_device_pg = 1;

//debug logs
var debuglog_block_search_deletion = false;
var srch_debuglogs = null;
var current_debuglog_pg = 1;

//debug logs
var loginlog_block_search_deletion = false;
var srch_loginlogs = null;
var current_loginlog_pg = 1;

//invites
var manage_invites = [];
var current_invites_pg = 1;
var srch_invites = null;

//sessions
var current_sessions_pg = 1;
var srch_sessions = null;

//bans
var current_userbans_pg = 1;
var current_devicebans_pg = 1;
var srch_bans_users = null;
var srch_bans_devices = null;
var devicebans_page_prefix_name = "devicebans";
var userbans_page_prefix_name = "userbans";

//ssv
var srch_ssv = null;
var current_ssv_pg = 1;


//////////////////////

const MILLISEC = {};
MILLISEC._SECOND = 1000,
MILLISEC._MINUTE = MILLISEC._SECOND * 60;
MILLISEC._HOUR = MILLISEC._MINUTE * 60;
MILLISEC._DAY = MILLISEC._HOUR * 24;
MILLISEC._MONTH = MILLISEC._DAY * 30.416; //30.416666666666668
MILLISEC._YEAR = MILLISEC._MONTH * 12;

var g_license_time = {
  years:0,
  months:0,
  days:0,
  hours:0,
  minutes:0
};

const STORE_USER_ROLES = {
  ADMIN:0,
  STAFF:1,
  USER:2,
  BANNED:3
};

const store_debug_types = {
  info:0,
  security:1,
  warning:2,
  error:3
};

const store_debug_priv_lvls = {
  none:0,
  user:1,
  admin:2,
  system:3
};

const login_result_t = {
	ok:0,
	user_does_not_exist:1,
	incorrect_password:2,
	banned:3,
	device_registration_failed:4,
	hwid_mismatch:5
};

const login_types = {
	main_login_windows_x86_x64:0
};

var callbacks = {};

callbacks.count = function(){
var cnt = 0;
Object.entries(this).forEach(entry => {
  let key = entry[0];
  let value = entry[1];
  if (key != "count")
  	cnt++;
});
return cnt;
};

g_id = 0;

var app;

$(document).ready(function(){
M.AutoInit();

//fix datepicker/time picker inside modal being fucked up
$('.datepicker').datepicker({
  container: 'body'
})

//$('.dropdown-trigger').dropdown();

var instance = M.Sidenav.getInstance(mysidenav);
//instance.open();
instance.options.outDuration = 500;

app = new App();
app.init();

onloaded_setup_store_etc();
onloaded_setup_apps_etc();
onloaded_setup_users_etc();
onloaded_setup_licenses_searchbar();
onloaded_setup_licenses_etc();
onloaded_setup_devices_etc();
onloaded_setup_debuglogs_etc();
onloaded_setup_loginlogs_etc();
onloaded_setup_invites_etc();
onloaded_setup_sessions_etc();
onloaded_setup_bans_etc();
onloaded_setup_ssv_etc();
setup_plugins_onloaded_etc();
});


//to-do: put methods in App
class App{
  constructor(){

  }

  init(){

  }

  get_tags(id)
  {
    var instance = M.Chips.getInstance(document.getElementById(id));
    var chips = instance.chipsData;
    var tags = [];
    for (var i = 0; i < chips.length; i++){
        tags[i] = chips[i].tag;
    }
    return tags;
  }

};

  /*$( ".tab a").click(function() {
  $(".tab a").removeClass("selected");
  $(this).addClass("selected");
});
*/

//http://balrob.blogspot.com/2014/04/windows-filetime-to-javascript-date.html
function fileTimeToDate( fileTime ) {

   return new Date ( fileTime / 10000 - 11644473600000 );
  };

function get_session_id(obj)
{
  return obj.parentNode.parentNode.parentNode.parentNode.id;
}

function process_admin_sessions(sessions)
{
  //alert(sessions);
  $("#preloader1").remove();
  var obj = JSON.parse(sessions);
  for (var i = 0; i < obj.length; i++)
      on_admin_session_created(obj[i]);
}

function get_first_element(nodes)
{
for (i = 0; i < nodes.length; i++){
if (nodes[i].nodeType == Node.ELEMENT_NODE)
return nodes[i];
}
return undefined;
}

function get_element_by_index(nodes, index)
{
  var cindex = 0;
for (i = 0; i < nodes.length; i++){
if (nodes[i].nodeType == Node.ELEMENT_NODE && cindex++ == index)
  return nodes[i];
}
return undefined;
}

function escape_html(unsafe) {
    if (typeof(unsafe) !== "string")
          return unsafe;
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

////////////////////////////////

function process_pages(current_page, pages, pageprefix, pagesid, page_navigation_funcname)
{
    var start_page, end_page;
    if (current_page <= 3){
        //1,2,3,4,5
        start_page = 1;
        end_page = 5;
    }else{
      //2,3,4,5,6
      var end_page = current_page + 2;
      var start_page = current_page - 2;//4-3=2
      if (end_page > pages){
          end_page = pages < 5 ? 5 : pages;
          start_page = (pages > 5) ? (pages - 5) : 1;
        }
    }

    {
      var html = '';
      var page_back_disabled = start_page == current_page;
      var page_forward_disabled = end_page == current_page;
      html += '<li class="';
      if (page_back_disabled)
            html += "disabled";
      html += '"><a href="#" ';
      if (!page_back_disabled)
            html += ' id="' + pageprefix + '-page_' + (current_page - 1) + '" onclick=' + page_navigation_funcname + '(this)';
      html += '><i class="material-icons">chevron_left</i></a></li>';
      for (var i = start_page; i <= end_page; i++){
            var classdata = '';
            if (i == current_page)
              classdata += 'active';
              if (i > pages)
              classdata += ' disabled';
            targetinfo = ' id="' + pageprefix + '-page_' + i + '"';
            html += '<li class="' + classdata +'"><a href="#" ' + targetinfo + ' onclick=' + page_navigation_funcname +'(this)>' + i + '</a></li>';
      }
      html += '<li class="waves-effect disabled"><a href="#"><i class="material-icons">chevron_right</i></a></li>';
      $(pagesid).html(html);
    }
}

function obj_to_array(o)
{
  var r = [];
  for (var prop in o)
          r.push(prop);
    return r;
}

////////////////////////////////

function on_admin_session_created(json_str)
{
  var s;
  if (typeof(json_str) !== "string")
          s = json_str;
          else
          s = JSON.parse(json_str);

  var html = '<div class="col">';
  html += '<div class="card black-text hoverable" id="admin-session-' + escape_html(s.id) +'">';
  html += '<div class="card-content cyan lighten-4">';
  html += '<div class="card-title">';
  html += '<span class="title">' + escape_html(s.ip) +'</span>';
  html += "<div class=\"right\"><span class=\"dropdown-trigger\" data-target='dropdown1' onclick=\"whom=get_session_id(this)\"><i class=\"material-icons\">more_vert</i></span></div><span class=\"right\">&nbsp;<!--create spacing between dropdown trigger--></span>";
  if (s.online)
    html += '<span class="badge green lighten-3 black-text">Online</span>';
  if (s.admin)
    html += '<span class="badge red lighten-3 black-text">Admin</span>';
  html += '</div>';
  html += '</div>';
  html += '<div class="card-content">';
  html += '<span class="rmargin5 tulk grey lighten-3">IP</span><span class="tulk grey lighten-5">' + escape_html(s.ip) + '</span>';
  html += '<span class="rmargin5 tulk grey lighten-3">Last active</span><span class="tulk grey lighten-5">30s ago</span>';
  html += '<br>';
  html += '<span class="tulk grey lighten-3">Created</span><span class="tulk grey lighten-5">11/18/2019 3:14 PM</span>';
  html += '<br>';
  html += '<div class="infoblock">';
  html += '<div><div class="tulk yellow accent-3">Attributes</div></div>';
  if (s.current)
    html += '<span class="tulk yellow accent-1">Current</span>';
  if (s.online)
    html += '<span class="tulk green accent-2">Live</span>';

  html += '</div>';

  html += '</div>';
  html += '</div>';
  html += '</div>';

  $("#admin_sessionlist").append(html);
  $('.dropdown-trigger').dropdown();
}

function on_admin_session_died(sid)
{
  $("#admin-session-" + sid).remove();
}


function oninputchanged(v, n)
{
  $(("#" + n)).text(v == 0 ? "unlimited" : v);
}

function myformatprop(s)
{
  return s.toUpperCase().replace(/[_]+/g, ' ');
}

function onloaded_setup_store_etc()
{
  $("#store_hwid_options").html("");
  var code = '';
  for (var prop in hwid_options){
      code += '<div class="col">';
      code += '<div class="card"><div class="card-content"><span class="card-title"><label>';
      code += '<input id="store-hwid-option-' + prop +'_enabled" type="checkbox" class="filled-in" checked="checked" />';
      code += '<span class="black-text">' + myformatprop(prop) +'</span>';
      code += '</label></span>';

      for (var subproperty in hwid_options[prop]){
        if (typeof(hwid_options[prop][subproperty]) === "boolean"){
          code += '<p><label>';
          var chked = hwid_options[prop][subproperty] ? "checked" : "";
          code += '<input type="checkbox" id="store-hwid-option-' + prop + "_" + subproperty + '" ' + chked + ' />';
          code += '<span class="blue-text text-darken-4">' + myformatprop(subproperty) + '</span>';
          code += '</label></p>';
        }
      }
      code += '</div></div></div>';
  }

  $("#store_hwid_options").html(code);

  var elems = document.getElementById("store_hwid_options").querySelectorAll("input[type='checkbox']");
  for (i = 0; i < elems.length; i++){
            $(elems[i]).change(function() {
              save_store_settings();//store_update_settings();
          });
  }

  $("#default_security_config").html("");
  code = '';
  for (var prop in security_cfg){
      code += '<div class="col">';
      code += '<div class="card"><div class="card-content"><span class="card-title"><label>';
      var chkd = 'checked';
      if (security_cfg[prop].hasOwnProperty("default"))
        chkd = security_cfg[prop]["default"] ? "checked" : "";
      code += '<input id="store-security-option-' + prop +'_enabled" type="checkbox" class="filled-in" ' + chkd + ' />';
      code += '<span class="black-text">' + myformatprop(prop) +'</span>';
      code += '</label></span>';

      for (var subproperty in security_cfg[prop]){
        if (subproperty == "default")
                continue;
        if (typeof(security_cfg[prop][subproperty]) === "boolean"){
          code += '<p><label>';
          var chked = security_cfg[prop][subproperty] ? "checked" : "";
          code += '<input type="checkbox" id="store-security-option-' + prop + "_" + subproperty + '" ' + chked + ' />';
          code += '<span class="blue-text text-darken-4">' + myformatprop(subproperty) + '</span>';
          code += '</label></p>';
        }
      }
      code += '</div></div></div>';
  }

  $("#default_security_config").html(code);

  var elems = document.getElementById("default_security_config").querySelectorAll("input[type='checkbox']");
  for (i = 0; i < elems.length; i++){
            $(elems[i]).change(function() {
              save_store_settings();//store_update_settings();
          });
  }
}

function prequery_store_settings()
{
  $("#loading_progress_store_settings").show();
  query_store_settings();
}

var initing_store_settings = false;

function on_store_settings_queried(json_str)
{
  initing_store_settings = true;
  $("#loading_progress_store_settings").hide();
  var o = JSON.parse(json_str);
  //console.log(json_str);
  if (o === null)
    o = {};
  /*if (!o.hasOwnProperty('registration')){
      o.registration = {};
      o.registration.disable_new_registrations = false;
      //...
  }*/
  o.get = function(n, vn){
    if (!this.hasOwnProperty(n))
      return false;
      if (this[n] === null)
          return false;
      if (!this[n].hasOwnProperty(vn))
        return false;
    return this[n][vn];
  };

  o.get_int = function(n, vn){
    if (!this.hasOwnProperty(n))
      return 0;
      if (this[n] === null)
          return 0;
      if (!this[n].hasOwnProperty(vn))
        return 0;
    return this[n][vn];
  };

  $("#setting_store_limited_access_login").prop("checked", o.get("login", "allow_limited_access_login"));
  $("#setting_store_device_locator").prop("checked", o.get("login", "device_locator"));

  //app default settings

  $("#setting_app_default_max_sessions").val(o.get_int("app", "max_sessions"));
  $("#setting_app_default_max_sessions").trigger("oninput");

  //hwid
  $("#setting_hwid_enabled").prop("checked", o.get("hwid", "enabled"));

  //hwid::gpu
  /*$("#setting_hwid_gpu").prop("checked", o.get("hwid", "gpu"));
  $("#setting_hwid_gpu_uuid").prop("checked", o.get("hwid", "gpu_uuid"));
  $("#setting_hwid_gpu_sn").prop("checked", o.get("hwid", "gpu_sn"));
  */

  {
  var elems = $("#store_hwid_options").find("input[type=checkbox]");
    for (var i = 0; i < elems.length; i++){
        var opt_id = elems[i].id.substr("store-hwid-option-".length);
        elems[i].checked = o.hwid !== undefined ? o.hwid[opt_id] : false;
    }
  }

  {
  var elems = $("#default_security_config").find("input[type=checkbox]");
    for (var i = 0; i < elems.length; i++){
        var opt_id = elems[i].id.substr("store-security-option-".length);
        elems[i].checked = o.security !== undefined ? o.security[opt_id] : false;
    }
  }

  $("#setting_disable_registration").prop("checked", o.get("registration", "disable_new_registrations"));
  $("#setting_reg_require_captcha").prop("checked", o.get("registration", "require_captcha"));
  $("#setting_reg_require_email").prop("checked", o.get("registration", "require_email"));
  $("#setting_reg_require_invite_code").prop("checked", o.get("registration", "require_invite_code"));

  $("#setting_reg_max_registrations_per_device").val(o.get_int("registration", "max_registrations_per_device"));
  M.FormSelect.init(document.getElementById("setting_reg_max_registrations_per_device")); //setting_reg_max_registrations_per_device

  initing_store_settings = false;
}

function save_store_settings()
{
  if (initing_store_settings)
          return;
  $("#loading_progress_store_settings").hide();
  var o = {};
  o.login = {};
  o.login.allow_limited_access_login = $("#setting_store_limited_access_login").prop("checked");
  o.login.device_locator = $("#setting_store_device_locator").prop("checked");

  o.app = {};
  o.app.max_sessions = parseInt($("#setting_app_default_max_sessions").val());

  o.hwid = {};
  o.hwid.enabled = $("#setting_hwid_enabled").prop("checked");

  {
  var elems = $("#store_hwid_options").find("input[type=checkbox]");
    for (var i = 0; i < elems.length; i++){
        var opt_id = elems[i].id.substr("store-hwid-option-".length);
        o.hwid[opt_id] = elems[i].checked;
    }
  }

  o.security = {};

  {
  var elems = $("#default_security_config").find("input[type=checkbox]");
    for (var i = 0; i < elems.length; i++){
        var opt_id = elems[i].id.substr("store-security-option-".length);
        o.security[opt_id] = elems[i].checked;
    }
  }

  //gpu
  /*o.hwid.gpu = $("#setting_hwid_gpu").prop("checked");
  o.hwid.gpu_uuid = $("#setting_hwid_gpu_uuid").prop("checked");
  o.hwid.gpu_sn = $("#setting_hwid_gpu_sn").prop("checked"); //note: gpu serialnumber might not be available, uuid is usually always available though
  */

  o.registration = {};
  o.registration.disable_new_registrations = $("#setting_disable_registration").prop("checked");
  o.registration.require_captcha = $("#setting_reg_require_captcha").prop("checked");
  o.registration.require_email = $("#setting_reg_require_email").prop("checked");
  o.registration.require_invite_code = $("#setting_reg_require_invite_code").prop("checked");
  o.registration.max_registrations_per_device = parseInt($("#setting_reg_max_registrations_per_device").val());
  server_save_store_settings(JSON.stringify(o));
}

function generate_access_key()
{
  if (access_keys_target != null)
    server_generate_access_key(access_keys_target); //generate app access key
  else
    server_generate_access_key(); //generate store access key
}

function revoke_access_key(obj)
{
  //console.log(obj.parentNode.parentNode.id);
  server_revoke_access_key(obj.parentNode.parentNode.id.substr("access-key-".length));
}

function on_access_key_revoked(id)
{
  var elem = document.getElementById("access-key-" + id);
  if (elem === null)
    return;
    elem.className = "red lighten-4";
    elem.childNodes[1].innerHTML = '<span class="badge red black-text">Revoked</span><a class="waves-effect waves-light btn blue lighten-1 purple-text text-darken-4 right" href="#" onclick=restore_access_key(this)>Restore</a>';
    console.log(elem.childNodes[1].innerHTML);
}

function on_access_key_restored(id)
{
  var elem = document.getElementById("access-key-" + id);
  if (elem === null)
    return;
    elem.className = "";
    elem.childNodes[1].innerHTML = '<a class="waves-effect waves-light btn red lighten-1 purple-text text-darken-4 right" href="#" onclick=revoke_access_key(this)>Revoke</a>';
}

function restore_access_key(obj)
{
  server_restore_access_key(obj.parentNode.parentNode.id.substr("access-key-".length));
}

function add_access_key(key)
{
  html = '<tr id="access-key-' +  escape_html(key.id) +'"' + (key.revoked ? " class='red lighten-4'" : "") + '>';
  html += '<td><div class="input-field" style="min-width: 550px"><input disabled value="' + escape_html(key.token) + '" type="text"></div>';
  html += '</td>';
  //html += '<td>' + key.version + '</td>';
  if (key.revoked)
    html += '<td><span class="badge red black-text">Revoked</span><a class="waves-effect waves-light btn blue lighten-1 purple-text text-darken-4 right" href="#" onclick=restore_access_key(this)>Restore</a></td>';
else
    html += '<td><a class="waves-effect waves-light btn red lighten-1 purple-text text-darken-4 right" href="#" onclick=revoke_access_key(this)>Revoke</a></td>';

  html += '</tr>';
  $("#accesskeylist").append(html);
}

function on_access_key_generated(json_str)
{
  var j = JSON.parse(json_str);
  if ($("#modal1").is(":visible")){
      if (j.is_app){
        if (access_keys_target !== null && access_keys_target == ("app-" + j.appid)){
            add_access_key(j);
        }
      }else{
        //check if we're currently viewing store access keys
        if (access_keys_target === null){
            add_access_key(j);
        }
      }
  }
}

function on_access_keys(json_str)
{
  $("#accesskeys-preloader1").hide();
  var j = JSON.parse(json_str);
  if (j === null)
  return;
  for (var i = 0; i < j.length; i++){
        add_access_key(j[i]);
  }
}

function set_access_keys_target(target)
{
  access_keys_target = target; //null for store, everything else indicates a specific app.
  $("#accesskeys-preloader1").show();
  $("#accesskeylist").empty();
  server_retrieve_access_keys(access_keys_target);
}

/////////////////////////////////////////////////////////////////////////////////////
//apps

function onloaded_setup_apps_etc()
{
  $("#app_hwid_options").html("");
  var code = '';
  for (var prop in hwid_options){
      code += '<div class="col">';
      code += '<div class="card"><div class="card-content"><span class="card-title"><label>';
      code += '<input id="app-hwid-option-' + prop +'_enabled" type="checkbox" class="filled-in" checked="checked" />';
      code += '<span class="black-text">' + myformatprop(prop) +'</span>';
      code += '</label></span>';

      for (var subproperty in hwid_options[prop]){
        if (typeof(hwid_options[prop][subproperty]) === "boolean"){
          code += '<p><label>';
          var chked = hwid_options[prop][subproperty] ? "checked" : "";
          code += '<input type="checkbox" id="app-hwid-option-' + prop + "_" + subproperty + '" ' + chked + ' />';
          code += '<span class="blue-text text-darken-4">' + myformatprop(subproperty) + '</span>';
          code += '</label></p>';
        }
      }
      code += '</div></div></div>';
  }

  $("#app_hwid_options").html(code);

  var elems = document.getElementById("app_hwid_options").querySelectorAll("input[type='checkbox']");
  for (i = 0; i < elems.length; i++){
            $(elems[i]).change(function() {
              save_app_settings();
          });
  }

  $("#app_security_config").html("");
  code = '';
  for (var prop in security_cfg){
      code += '<div class="col">';
      code += '<div class="card"><div class="card-content"><span class="card-title"><label>';
      var chkd = 'checked';
      if (security_cfg[prop].hasOwnProperty("default"))
        chkd = security_cfg[prop]["default"] ? "checked" : "";
      code += '<input id="app-security-option-' + prop +'_enabled" type="checkbox" class="filled-in" ' + chkd + ' />';
      code += '<span class="black-text">' + myformatprop(prop) +'</span>';
      code += '</label></span>';

      for (var subproperty in security_cfg[prop]){
        if (subproperty == "default")
                continue;
        if (typeof(security_cfg[prop][subproperty]) === "boolean"){
          code += '<p><label>';
          var chked = security_cfg[prop][subproperty] ? "checked" : "";
          code += '<input type="checkbox" id="app-security-option-' + prop + "_" + subproperty + '" ' + chked + ' />';
          code += '<span class="blue-text text-darken-4">' + myformatprop(subproperty) + '</span>';
          code += '</label></p>';
        }
      }
      code += '</div></div></div>';
  }

  $("#app_security_config").html(code);

  var elems = document.getElementById("app_security_config").querySelectorAll("input[type='checkbox']");
  for (i = 0; i < elems.length; i++){
            $(elems[i]).change(function() {
              save_app_settings();
          });
  }
}

function prequery_app_settings()
{
  $("#loading_progress_app_settings").show();
  query_app_settings(appid.substr("app-".length));
}

var initing_app_settings = false;

function on_app_settings_queried(json_str)
{
  initing_app_settings = true;
  $("#loading_progress_app_settings").hide();
  var o = JSON.parse(json_str);
  if (o === null)
    o = {};

  o.get = function(n, vn){
    if (!this.hasOwnProperty(n))
      return false;
      if (this[n] === null)
          return false;
      if (!this[n].hasOwnProperty(vn))
        return false;
    return this[n][vn];
  };

  o.get_int = function(n, vn){
    if (!this.hasOwnProperty(n))
      return 0;
      if (this[n] === null)
          return 0;
      if (!this[n].hasOwnProperty(vn))
        return 0;
    return this[n][vn];
  };

  $("#setting_app_limited_access_login").prop("checked", o.get("login", "allow_limited_access_login"));
  $("#setting_app_device_locator").prop("checked", o.get("login", "device_locator"));

  //app default settings

  $("#setting_app_max_sessions").val(o.get_int("app", "max_sessions"));
  $("#setting_app_max_sessions").trigger("oninput");

  //hwid
  $("#setting_hwid_enabled_app").prop("checked", o.get("hwid", "enabled"));

  {
  var elems = $("#app_hwid_options").find("input[type=checkbox]");
    for (var i = 0; i < elems.length; i++){
        var opt_id = elems[i].id.substr("app-hwid-option-".length);
        elems[i].checked = o.hwid !== undefined ? o.hwid[opt_id] : false;
    }
  }

  {
  var elems = $("#app_security_config").find("input[type=checkbox]");
    for (var i = 0; i < elems.length; i++){
        var opt_id = elems[i].id.substr("app-security-option-".length);
        elems[i].checked = o.security !== undefined ? o.security[opt_id] : false;
    }
  }

  initing_app_settings = false;
}

function save_app_settings()
{
  if (initing_app_settings)
          return;
  var o = {};
  o.login = {};
  o.login.allow_limited_access_login = $("#setting_app_limited_access_login").prop("checked");
  o.login.device_locator = $("#setting_app_device_locator").prop("checked");

  o.app = {};
  o.app.max_sessions = parseInt($("#setting_app_max_sessions").val());

  o.hwid = {};
  o.hwid.enabled = $("#setting_hwid_enabled_app").prop("checked");

  {
  var elems = $("#app_hwid_options").find("input[type=checkbox]");
    for (var i = 0; i < elems.length; i++){
        var opt_id = elems[i].id.substr("app-hwid-option-".length);
        o.hwid[opt_id] = elems[i].checked;
    }
  }

  o.security = {};

  {
  var elems = $("#app_security_config").find("input[type=checkbox]");
    for (var i = 0; i < elems.length; i++){
        var opt_id = elems[i].id.substr("app-security-option-".length);
        o.security[opt_id] = elems[i].checked;
    }
  }

  o.app_id = appid.substr("app-".length);

  server_save_app_settings(JSON.stringify(o));
}


function download_public_key()
{
  server_request_app_publickey(appid.substr("app-".length));
}

function delete_app()
{
  server_delete_app(appid.substr("app-".length));
  $("#appname").click(); //dismiss card
}

function on_app_deleted(id)
{
  $("#app-" + id).remove();
}

function _create_app()
{
  create_app($("#appname_input").val());
}

function on_app_created(s)
{
  var obj = JSON.parse(s);
  var html = "<tr id=\"app-" + escape_html(obj.id) + "\">";
  html += "<td>" + escape_html(obj.name) + "</td>";
  html += "<td>0</td>";
  html += "<td>0</td>";
  html += "<td>0</td>";
  //html += '<td><a class="btn waves-effect waves-light activator teal darken-4 cyan-text text-accent-2" onclick=manageapp(this)>Manage</a></td>';
  html += '<td><a class="btn waves-effect waves-light activator" onclick=manageapp(this)>Manage</a></td>';
  html += "</tr>";
  $("#applist").append(html);
}

function apps_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr("app-page_".length));
  apps_navigate(page_num);
}

function request_apps_list()
{
  apps_navigate(1);
}

function on_apps(json_str)
{
  $("#applist").html("");
  var j = JSON.parse(json_str);
  if (j.length == 0)
    return;
    var current_page = j[0]["current_page"];
    var pages = j[0]["pages"];
    var start_page, end_page;
    if (current_page <= 3){
        //1,2,3,4,5
        start_page = 1;
        end_page = 5;
    }else{
      //2,3,4,5,6
      var end_page = current_page + 2;
      var start_page = current_page - 2;//4-3=2
      if (end_page > pages){
          end_page = pages < 5 ? 5 : pages;
          start_page = (pages > 5) ? (pages - 5) : 1;
        }
    }

    {
      var html = '';
      var page_back_disabled = start_page == current_page;
      var page_forward_disabled = end_page == current_page;
      html += '<li class="';
      if (page_back_disabled)
            html += "disabled";
      html += '"><a href="#" ';
      if (!page_back_disabled)
            html += ' id="app-page_' + (current_page - 1) + '" onclick=apps_navigate_page(this)';
      html += '><i class="material-icons">chevron_left</i></a></li>';
      for (var i = start_page; i <= end_page; i++){
            var classdata = '';
            if (i == current_page)
              classdata += 'active';
              if (i > pages)
              classdata += ' disabled';
            targetinfo = ' id="app-page_' + i + '"';
            html += '<li class="' + classdata +'"><a href="#" ' + targetinfo + ' onclick=apps_navigate_page(this)>' + i + '</a></li>';
      }
      html += '<li class="waves-effect disabled"><a href="#"><i class="material-icons">chevron_right</i></a></li>';
      $("#app_pages").html(html);
    }


  for (var i = 1; i < j.length; i++){
    var html = "<tr id=\"app-" + escape_html(j[i].id) + "\">";
    html += "<td>" + j[i].id + "</td>";
    html += "<td>" + escape_html(j[i].name) + "</td>";
    html += "<td>" + escape_html(j[i].licenses) +"</td>";
    html += "<td>" + escape_html(j[i]["debug_logs"]) +"</td>"; //to-do: show (new) for unread debug logs
    html += "<td>" + escape_html(j[i].logins_24h) +"</td>";
    html += '<td><a class="btn waves-effect waves-light activator" onclick=manageapp(this)>Manage</a></td>';
    html += "</tr>";
    $("#applist").append(html);
  }
}

function manageapp(x)
{
  //console.log(x.parentNode.parentNode.childNodes[1].innerText);
  $("#appname").html(get_first_element(x.parentNode.parentNode.childNodes).innerText + '<i class="material-icons right">close</i>');
  appid = x.parentNode.parentNode.id;
}

///////////////////////////////////////////////////////////////////////////
//users related stuff

function userinfo_devices_check_uncheck_all(obj)
{
  var elems = document.getElementById("user-info-devices").querySelectorAll("input[type='checkbox']");
  for (i = 0; i < elems.length; i++){
    $(elems[i]).prop( "checked", $(obj).prop("checked"));
    $(elems[i]).trigger("change");
  }
}

function userinfo_related_accounts_check_uncheck_all(obj)
{
  var elems = document.getElementById("licenselist").querySelectorAll("input[type='checkbox']");
  for (i = 0; i < elems.length; i++){
    $(elems[i]).prop( "checked", $(obj).prop("checked"));
    $(elems[i]).trigger("change");
  }
}

function do_ban()
{
  var opts = [];
  opts[0] = $("#userinfo-ban_current_acc").prop("checked");
  opts[1] = $("#userinfo-ban_all_account_relations").prop("checked");
  opts[2] = $("#userinfo-ban_all_devices").prop("checked");
  opts[3] = parseInt(document.getElementById("banduration-slider").noUiSlider.get());
  server_perform_superban(g_user_id.substr("user-".length),
  obj_to_array(ban__selected_devices),
  obj_to_array(ban__selected_users),
  opts);

  /*
  last_banned_users_list = obj_to_array(ban__selected_users);
  last_banned_users_list.push(g_user_id.substr("user-".length));
  if (opts[0])
      $("#select-user-role").change(1);
  */
}

function on_banned_or_unbanned_users(json_str, banned)
{
  //using ban__selected_users
  var usrs = JSON.parse(json_str);

  for (var i = 0; i < usrs.length; i++){
    console.log("Banned/Unbanned user: " + usrs[i]);
    var elem = document.getElementById("user-" + usrs[i]);
    if (elem !== null)
        banned ? $(elem).addClass("red") : $(elem).removeClass("red");
  }

  if (!banned)
    on_unbanned_users(usrs);
  //request_users_list();
}

function on_banned_or_unbanned_devices(json_str, banned)
{
  var j = JSON.parse(j);
  if (!banned)
  on_unbanned_devices(j);
}

function userinfo_devices_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr(pageinfo.indexOf(page_delimiter) + page_delimiter.length));
  current_userinfo_devices_pg = page_num;
  query_user_info_devices(page_num, g_user_id.substr("user-".length));
}

function userinfo_related_accs_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr(pageinfo.indexOf(page_delimiter) + page_delimiter.length));
  current_userinfo_related_accs_pg = page_num;
  $("#user-info-related-accs").html("");
  query_user_info_related_accounts(page_num, obj_to_array(ban__selected_devices), $("#userinfo-ban_all_devices").prop("checked"), g_user_id.substr("user-".length));
}

function ban_user_and_devices()
{
  var instance = M.Modal.getInstance(document.getElementById("modal_ban"));
  instance.open();
  $("#ban-load-user-info-progress").show();
  //$("#user-info").hide();

  ban__selected_users = {};
  ban__selected_devices = {};

  $("#user-info-devices").html("");
  $("#user-info-related-accs").html("");
  $("#relateddeviceslabel").text("Devices (?)");
  $("#relatedaccountslabel").text("Related Accounts (?)");

  current_userinfo_devices_pg = 1;
  current_userinfo_related_accs_pg = 1;

  if (test_mode_enabled){
    //ban__selected_devices["testdeviceid1"] = 1;
    test_add_device_info();
  }
else
query_user_info_devices(1, g_user_id.substr("user-".length));
}

function do_update_related_accs()
{
  var elems = document.getElementById("user-info-devices").querySelectorAll("input[type='checkbox']");
  for (i = 0; i < elems.length; i++){
    var id = elems[i].parentNode.parentNode.parentNode.parentNode.id;
    id = id.substr("user-info-device-".length);
    //console.log(id);
    if (!elems[i].checked){
        delete ban__selected_devices[id];
        continue;
    }
    ban__selected_devices[id] = 1;
  }

  var sel_dvc_cnt = Object.keys(ban__selected_devices).length;
  if (!$("#userinfo-ban_all_devices").prop("checked")){
    $("#user-info-related-accs").html("");
    ban__selected_users = {}; //reset
  if (sel_dvc_cnt != 0){
    current_userinfo_related_accs_pg = 1;
    query_user_info_related_accounts(1, obj_to_array(ban__selected_devices), $("#userinfo-ban_all_devices").prop("checked"), g_user_id.substr("user-".length));
  }
}

}

function view_device_info(target)
{

}

function on_user_info_queried_devices(json_str)
{
  $("#ban-load-user-info-progress").hide();
  $("#user-info-devices").html("");

  var j = JSON.parse(json_str);
  if (j.length == 0)
    return;
  process_pages(j[0]["current_page"], j[0]["pages"], "user-info-devices", "#user-info-devices_pages", 'userinfo_devices_navigate_page');

  $("#relateddeviceslabel").text(`Devices (${j[0]["count"]})`);
  var html = "";

  for (var i = 1; i < j.length; i++){
    html += "<tr id=\"user-info-device-" + escape_html(j[i].id) + "\">";
    html += '<td><p><label><input type="checkbox" /><span></span></label></p></td>';
    html += "<td>" + j[i].did + (j[i].banned ? " (banned)" : "") + "</td>";
    html += "<td>" + j[i].device_type +"</td>";
    html += "<td>" + j[i].reg_ip + "</td>";
    html += "<td>" + j[i]["last_login_ip"] + "</td>"; //current_ip
    html += "<td>" + new Date(j[i].last_login).toLocaleString() +"</td>";
    html += "<td>" + new Date(j[i].registration).toLocaleString() +"</td>";
    html += "<td><a class=\"btn\" onclick=view_device_info(this) href=\"#\">Device Info</td>"; //
    //html += "<td>" + j[i]["related_accounts_count"] + "</td>";
    html += "</tr>";
  }
  $("#user-info-devices").append(html);

  for (const property in ban__selected_devices) {
      var elem = document.getElementById("user-info-device-" + property);
      if (elem !== null && ban__selected_devices[property] == 1){
          var cb = elem.querySelector("input[type='checkbox']");
          cb.checked = true;
      }
}

  $('#user-info-devices').children().each(function () {
  //$(this) => <tr>
  $(this).children().each(function(){
      //$(this) => td
      var results = $(this).find("input");
      if (results.length != 1)
          return;
          $(results[0]).change(function() {
              do_update_related_accs();
          });
    });

  });

}

function test_add_device_info()
{
  var j = [];
  j[0] = {};
  j[1] = {};
  j[0].current_page = 1;
  j[0]["count"] = 1337;
  j[0].pages = 10;

  j[1].did = j[1].id = "testdeviceid1";
  j[1].banned = true;
  j[1].device_type = "Windows (x64)";
  j[1].reg_ip = "::1";
  j[1].last_login_ip = "::1";
  j[1].last_login = new Date().getTime();
  j[1].registration = new Date().getTime();
  on_user_info_queried_devices(JSON.stringify(j));
}

function on_related_acc_cb_updated()
{
  var elems = document.getElementById("user-info-related-accs").querySelectorAll("input[type='checkbox']");
  for (i = 0; i < elems.length; i++){
    var id = elems[i].parentNode.parentNode.parentNode.parentNode.id;
    id = id.substr("user-info-related-".length);
    if (!elems[i].checked){
        delete ban__selected_users[id];
        continue;
    }
    ban__selected_users[id] = 1;
  }
}

function on_user_info_queried_related_accs(json_str)
{
  //$("#ban-load-user-info-progress").hide();
  $("#user-info-related-accs").html("");

  var j = JSON.parse(json_str);
  if (j.length == 0)
    return;
  process_pages(j[0]["current_page"], j[0]["pages"], "user-info-related", "#user-info-related_pages", 'userinfo_related_accs_navigate_page');

  $("#relatedaccountslabel").text(`Related Accounts (${j[0]["count"] })`);
  var html = "";

  for (var i = 1; i < j.length; i++){
    html += "<tr id=\"user-info-related-" + escape_html(j[i].id) + "\">";
    html += '<td><p><label><input type="checkbox" /><span></span></label></p></td>';
    html += "<td>" + escape_html(j[i].username) + "/" + j[i].id + (j[i].banned ? " (banned)" : "") + "</td>";
    html += "</tr>";
  }
  $("#user-info-related-accs").append(html);

  for (const property in ban__selected_users) {
      var elem = document.getElementById("user-info-related-" + property);
      if (elem !== null && ban__selected_users[property] == 1){
          var cb = elem.querySelector("input[type='checkbox']");
          cb.checked = true;
      }
    }

  $('#user-info-related-accs').children().each(function () {
  //$(this) => <tr>
  $(this).children().each(function(){
      //$(this) => td
      var results = $(this).find("input");
      if (results.length != 1)
          return;
          $(results[0]).change(function() {
              on_related_acc_cb_updated();
          });
    });

  });

}


function on_password_reset(id, pass)
{
  callbacks[id](pass);
  delete callbacks[id];
}

function manageuser(x)
{
  g_user_name = get_element_by_index(x.parentNode.parentNode.childNodes, 1).innerText;
  $("#manage_user_name").html(escape_html(g_user_name)); //+ '<i class="material-icons right">close</i>'
  g_user_id = x.parentNode.parentNode.id;
  var objs = x.parentNode.parentNode.childNodes;
  for (i = 0; i < objs.length; i++){
      if (typeof(objs[i].dataset) !== "undefined" &&
          typeof(objs[i].dataset.role) !== "undefined"){
            //objs[i].dataset.role
            //alert(objs[i].dataset.role);
            $("#select-user-role").val(objs[i].dataset.role);
            if (objs[i].dataset.role == STORE_USER_ROLES.BANNED ||
                objs[i].dataset.banned == true){
                $("#manage_user_unban").show();
                $("#manage_user_ban").hide();
              }else{
                $("#manage_user_ban").show();
                $("#manage_user_unban").hide();
              }
            $("#select-user-role").formSelect();
            break;
      }
  }
  var instance = M.Modal.getInstance(document.getElementById("modal3"));
  instance.open();
}


function users_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr("user-page_".length));
  current_users_pg = page_num;
  users_navigate(page_num, srch_users);
}


function search_users()
{
  current_users_pg = 1;
  var search_tags = app.get_tags('userssearch');
  if (search_tags.length == 0){
      srch_users = null;
      users_navigate(1, srch_users);
  }else{
  srch_users = JSON.stringify(search_tags);
  users_navigate(1, srch_users);
}

}


function onloaded_setup_users_etc()
{
  var instance = M.Chips.getInstance(document.getElementById('userssearch'));
  //search_users = function(){}; //for debugging

  instance.options.onChipAdd = function(){
    search_users();
  };

  instance.options.onChipDelete = function(){
    search_users();
  };


  var slider = document.getElementById('banduration-slider');
  noUiSlider.create(slider, {
   start: [1],
   connect: true,
   //cssPrefix: 'noUiX-',
   step: 1,
   orientation: 'horizontal', // 'horizontal' or 'vertical'
   range: {
     'min': 0,
     'max': 1000
   },
   format: wNumb({
     decimals: 0
   })
  });

}



function request_users_list()
{
  users_navigate(current_users_pg, srch_users);
}

function user_reset_password()
{
  var uid = g_user_id.substr("user-".length);
  var id = ++g_id;//var id = callbacks.count();
  var username = g_user_name;
  callbacks[id] = function(password){
      //username
      var inst = M.Modal.getInstance(document.getElementById("modal_pw_reset_result"));
      $("#pw_reset_user").text(username);
      $("#reset_r_passwordbox").val(password);
      M.updateTextFields();
      inst.open();
  };

  server_reset_account_password(uid, id);
  //also kick off existing sessions when password changed.
}


function update_user_role()
{
    var role = parseInt($("#select-user-role").val());
    if (role == STORE_USER_ROLES.BANNED){
        $("#manage_user_unban").show();
        $("#manage_user_ban").hide();
      }else{
        $("#manage_user_ban").show();
        $("#manage_user_unban").hide();
      }
      switch (role){
        case STORE_USER_ROLES.ADMIN:
        role_str = "Admin";
        break;
        case STORE_USER_ROLES.STAFF:
        role_str = "Staff";
        break;
        case STORE_USER_ROLES.USER:
        role_str = "User";
        break;
        case STORE_USER_ROLES.BANNED:
        role_str = "Banned";
        break;
        default:
        role_str = "Custom Role";
        break;
      }
    $(("#" + g_user_id + "-role")).text(role_str);
    //$(("#" + g_user_id + "-role")).data("role", role);
    $(("#" + g_user_id + "-role")).attr("data-role", role);
    server_update_account_role(g_user_id, role);
}


function on_users(json_str)
{
  $("#userlist").html("");
  var j = JSON.parse(json_str);
  if (j.length == 0)
    return;
    var current_page = j[0]["current_page"];
    var pages = j[0]["pages"];
    var start_page, end_page;
    if (current_page <= 3){
        //1,2,3,4,5
        start_page = 1;
        end_page = 5;
    }else{
      //2,3,4,5,6
      var end_page = current_page + 2;
      var start_page = current_page - 2;//4-3=2
      if (end_page > pages){
          end_page = pages < 5 ? 5 : pages;
          start_page = (pages > 5) ? (pages - 5) : 1;
        }
    }

    {
      var html = '';
      var page_back_disabled = start_page == current_page;
      var page_forward_disabled = end_page == current_page;
      html += '<li class="';
      if (page_back_disabled)
            html += "disabled";
      html += '"><a href="#" ';
      if (!page_back_disabled)
            html += ' id="app-page_' + (current_page - 1) + '" onclick=users_navigate_page(this)';
      html += '><i class="material-icons">chevron_left</i></a></li>';
      for (var i = start_page; i <= end_page; i++){
            var classdata = '';
            if (i == current_page)
              classdata += 'active';
              if (i > pages)
              classdata += ' disabled';
            targetinfo = ' id="user-page_' + i + '"';
            html += '<li class="' + classdata +'"><a href="#" ' + targetinfo + ' onclick=users_navigate_page(this)>' + i + '</a></li>';
      }
      html += '<li class="waves-effect disabled"><a href="#"><i class="material-icons">chevron_right</i></a></li>';
      $("#user_pages").html(html);
    }


  for (var i = 1; i < j.length; i++){
    var html = "<tr id=\"user-" + escape_html(j[i].id) + "\"";
    if (j[i].banned)
        html += " class='red accent-1'";
    html += ">";
    html += "<td>" + j[i].id + "</td>"; //id is 100% server-sided, no need to escape html
    html += "<td>" + escape_html(j[i].username) + "</td>";
    html += "<td>" + escape_html(j[i].email) +"</td>";
    html += "<td>" + escape_html(j[i].ip) +"</td>"; //to-do: show (new) for unread debug logs
    //console.log(j[i].join_date);
    html += "<td>" + new Date(j[i].join_date).toLocaleString() +"</td>"; //fileTimeToDate
    if (j[i].last_login == 0)
        html += "<td>N/A</td>";
    else
        html += "<td id='user-" + escape_html(j[i].id) + "-role'>" + new Date(j[i].last_login).toLocaleString() +"</td>";
        html += "<td data-role='" + j[i].role + "' ";
        html += "data-banned='" + j[i].banned + "' ";
        html += ">";
    switch (j[i].role){
      case STORE_USER_ROLES.ADMIN:
      html += "Admin";
      break;
      case STORE_USER_ROLES.STAFF:
      html += "Staff";
      break;
      case STORE_USER_ROLES.USER:
      html += "User";
      break;
      case STORE_USER_ROLES.BANNED:
      html += "Banned";
      break;
      default:
      html += "Custom Role";
      break;
    }
    html += '</td>';
    html += '<td><a class="btn waves-effect waves-light activator" href="#" onclick=manageuser(this)>Manage</a></td>';
    html += "</tr>";
    $("#userlist").append(html);
  }
}

///////////////////////////////////////////////////////////////////////////
//licenses

function licenses_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr("license-page_".length));
  current_licenses_pg = page_num;
  licenses_navigate(page_num, srch_licenses);
}

function request_licenses_list()
{
  licenses_navigate(current_licenses_pg, srch_licenses);
}

function search_licenses()
{
  current_licenses_pg = 1;
  var search_tags = app.get_tags('license_search');
  if (search_tags.length == 0){
      srch_licenses = null;
      licenses_navigate(1, srch_licenses);
  }else{
  srch_licenses = JSON.stringify(search_tags);
  licenses_navigate(1, srch_licenses);
  }
}

function license_delete_device(obj)
{
  //alert(obj.parentNode.id);
  server_license_delete_devices(manage_licenses[0], [obj.parentNode.id]);
}

function on_server_license_query_devices_for_management(json_str)
{
  var html = '';
  var obj = JSON.parse(json_str);
  for (i = 0; i < obj.devices.length; i++){
    html += '<div class="chip" id="' + obj.devices[i]["id"] +'">';
    html += obj.devices[i].id + '<i class="close material-icons" onclick=license_delete_device(this)>close</i>';
    html += '</div>';
  }

  $("#device_container").html(html);
}

function manage_license(x)
{
  g_license_key = get_element_by_index(x.parentNode.parentNode.childNodes, 2).innerText;
  $("#cl_license_key").text(g_license_key); //+ '<i class="material-icons right">close</i>'
  manage_licenses = [];
  manage_licenses.push(x.parentNode.parentNode.id.substr("license-".length));

  if (!test_mode_enabled)
    $("#device_container").html('');

  server_license_query_devices_for_management(manage_licenses[0]);

  var instance = M.Modal.getInstance(document.getElementById("manage_license_modal"));
  instance.open();
}

function on_licenses_deleted(json_str)
{
  var lcs_deleted = JSON.parse(json_str);
  for (i = 0; i < lcs_deleted.length; i++){
        var elem = document.getElementById("license-" + lcs_deleted[i]);
        if (elem === null)
              continue;
        elem.parentNode.removeChild(elem);
  }
  request_licenses_list();
}

function deleted_licenses_partial()
{
  M.toast({html:"<p class='red-text'>Unable to delete all licenses.</p>"});
  request_licenses_list();
}

function mass_delete_licenses()
{
  if (manage_licenses.length == 0)
          return;
    server_mass_delete_licenses(JSON.stringify(manage_licenses));
}

function mass_manage_licenses()
{
  if (manage_licenses.length == 0)
          return;

  $("#cl_license_key").text("<selected licenses>");
  var instance = M.Modal.getInstance(document.getElementById("manage_license_modal"));
  instance.open();
}

function licenses_check_uncheck_all(obj)
{
  var elems = document.getElementById("licenselist").querySelectorAll("input[type='checkbox']");
  for (i = 0; i < elems.length; i++){
    $(elems[i]).prop( "checked", $(obj).prop("checked"));
  }
}

function licenses_execute_go()
{
  manage_licenses = [];
  var elems = document.getElementById("licenselist").querySelectorAll("input[type='checkbox']:checked");
  for (i = 0; i < elems.length; i++){
    var id = elems[i].parentNode.parentNode.parentNode.parentNode.id;
    manage_licenses.push(id.substr("license-".length));
  }
  /*
  //was planning on using this instead
  var children = $("#licenselist").children();
  for (i = 0; i < children.length; i++){
  var child = children[i];
  child.cells[0].childNodes[0]
  }
  */

  switch (parseInt($("#license_go_select").val())){
    case 1:
    mass_delete_licenses();
    break;
    case 2:
    mass_manage_licenses();
    break;
  }
}

function on_licenses_generated(s)
{
    $("#licensekeys").val(s);
    M.textareaAutoResize($('#licensekeys'));
    var mdl = M.Modal.getInstance(document.getElementById('modal_licenses_generated'));
    mdl.open();
    $("#licensekeys").focus();
    request_licenses_list();
}

function extract_expiration(duration)
{
  var yrs = Math.floor(duration / MILLISEC._YEAR);
  duration %= MILLISEC._YEAR;
  var months = Math.floor(duration / MILLISEC._MONTH);
  duration %= MILLISEC._MONTH;
  var days = Math.floor(duration / MILLISEC._DAY);
  duration %= MILLISEC._DAY;
  var hours = Math.floor(duration / MILLISEC._HOUR);
  duration %= MILLISEC._HOUR;
  var minutes = Math.floor(duration / MILLISEC._MINUTE);
  /*if (yrs)
      return yrs + " Year(s), " + months + " month(s)";
      else if (months)
      return months + " month(s) " + days + "day(s)";
      */
  var ret = "";
  if (yrs)
    ret += yrs + " year(s)";
  if (months){
    if (ret.length)
      ret += ", ";
      ret += months + " month(s)";
  }
  if (days){
    if (ret.length)
      ret += ", ";
      ret += days + " day(s)";
  }
  if (hours){
    if (ret.length)
      ret += ", ";
      ret += hours + " hour(s)";
  }

  if (minutes){
    if (ret.length)
      ret += ", ";
      ret += minutes + " minute(s)";
  }
  return ret;
}

function on_licenses(json_str)
{
  $("#licenselist").html("");
  var j = JSON.parse(json_str);
  if (j.length == 0)
    return;
  process_pages(j[0]["current_page"], j[0]["pages"], "license", "#license_pages", 'licenses_navigate_page');

  for (var i = 1; i < j.length; i++){
    var html = "<tr id=\"license-" + escape_html(j[i].id) + "\">";
    html += '<td><p><label><input type="checkbox" /><span></span></label></p></td>';
    html += "<td>" + j[i].id + "</td>"; //id is 100% server-sided, no need to escape html
    html += "<td>" + j[i].license + "</td>";
    html += "<td>" + j[i].device_count + "/" + j[i].max_devices +"</td>";
    html += "<td>" + j[i].sessions + "/" + j[i].max_sessions +"</td>";
    html += "<td>" + j[i].activations + "/" + j[i].max_activations +"</td>";
    //console.log(j[i].join_date);
    html += "<td>" + new Date(j[i].created).toLocaleString() +"</td>";
    if (j[i].hasOwnProperty("expiration"))
      html += "<td>" + new Date(j[i].expiration).toLocaleString() +"</td>";
    else
      html += "<td>" + extract_expiration(j[i].duration) +"</td>";


    html += "<td>";
    if (typeof(j[i].users) !== "undefined" && j[i].users !== null)
    for (n = 0; n < j[i].users.length; n++){
        html += '<div class="chip">' + escape_html(j[i].users[n]) + '</div>';
    }
    html += "</td>";

    html += "<td>";
    if (j[i].tied_apps !== null)
    for (n = 0; n < j[i].tied_apps.length; n++){
        html += '<div class="chip">' + escape_html(j[i].tied_apps[n]) + '</div>';
    }
    html += "</td>";

    html += '<td><a class="btn waves-effect waves-light activator" href="#" onclick=manage_license(this)>Manage</a></td>';
    html += "</tr>";
    $("#licenselist").append(html);
  }
}


function delete_search_results_licenses()
{
  var instance = M.Chips.getInstance(document.getElementById('license_search'));
  licenses_block_search_deletion = true;
  for (n = instance.chipsData.length - 1; n > -1; n--)
      instance.deleteChip(n);
  licenses_block_search_deletion = false;
}

function update_license_time()
{
  var x = '';
  if (g_license_time.years > 0)
    x += g_license_time.years + " year(s)";
    if (g_license_time.months){
      if (x.length)
        x += ', ';
        x += g_license_time.months + " month(s)";
    }
    if (g_license_time.days){
      if (x.length)
        x += ', ';
        x += g_license_time.days + " day(s)";
    }
    if (g_license_time.hours){
      if (x.length)
        x += ', ';
        x += g_license_time.hours + " hour(s)";
    }

    if (g_license_time.minutes){
      if (x.length)
        x += ', ';
        x += g_license_time.minutes + " minute(s)";
    }
    $("#current-license-time").text(x);
}

function onloaded_setup_licenses_etc()
{
  $('input[type=radio][name=group1]').change(function() {
    switch (parseInt(this.value)){
      case 1:
      $("#license_duration-datetime").hide();
      $("#license_duration-sliders").hide();
      break;
      case 2:
      $("#license_duration-sliders").hide();
      $("#license_duration-datetime").show();
      break;
      case 3:
      $("#license_duration-datetime").hide();
      $("#license_duration-sliders").show();
      break;
    }
});

  var slider = document.getElementById('license_max_devices-slider');
  noUiSlider.create(slider, {
   start: [1],
   connect: true,
   //cssPrefix: 'noUiX-',
   step: 1,
   orientation: 'horizontal', // 'horizontal' or 'vertical'
   range: {
     'min': 0,
     'max': 100
   },
   format: wNumb({
     decimals: 0
   })
  });

  var slider2 = document.getElementById('license_max_sessions-slider');
  noUiSlider.create(slider2, {
   start: [1],
   //cssPrefix: 'noUiX-',
   connect: true,
   step: 1,
   orientation: 'horizontal', // 'horizontal' or 'vertical'
   range: {
     'min': 0,
     'max': 100
   },
   format: wNumb({
     decimals: 0
   })
  });

  var slider3 = document.getElementById('license_max_activations-slider');
  noUiSlider.create(slider3, {
   start: [1],
   //cssPrefix: 'noUiX-',
   connect: true,
   step: 1,
   orientation: 'horizontal', // 'horizontal' or 'vertical'
   range: {
     'min': 0,
     'max': 100
   },
   format: wNumb({
     decimals: 0
   })
 });

 var slider4 = document.getElementById('license_num_copies-slider');
 noUiSlider.create(slider4, {
  start: [1],
  //cssPrefix: 'noUiX-',
  connect: true,
  step: 1,
  orientation: 'horizontal', // 'horizontal' or 'vertical'
  range: {
    'min': 1,
    'max': 1000
  },
  format: wNumb({
    decimals: 0
  })
});

var years_slider = document.getElementById('license-years-slider');
noUiSlider.create(years_slider, {
 start: [0],
 //cssPrefix: 'noUiX-',
 connect: true,
 step: 1,
 orientation: 'horizontal', // 'horizontal' or 'vertical'
 range: {
   'min': 0,
   'max': 999
 },
 format: wNumb({
   decimals: 0
 })
});

var months_slider = document.getElementById('license-months-slider');

noUiSlider.create(months_slider, {
 start: [0],
 //cssPrefix: 'noUiX-',
 connect: true,
 step: 1,
 orientation: 'horizontal', // 'horizontal' or 'vertical'
 range: {
   'min': 0,
   'max': 12
 },
 format: wNumb({
   decimals: 0
 })
});

var days_slider = document.getElementById('license-days-slider');
noUiSlider.create(days_slider, {
 start: [0],
 //cssPrefix: 'noUiX-',
 connect: true,
 step: 1,
 orientation: 'horizontal', // 'horizontal' or 'vertical'
 range: {
   'min': 0,
   'max': 31
 },
 format: wNumb({
   decimals: 0
 })
});

var hours_slider = document.getElementById('license-hours-slider');
noUiSlider.create(hours_slider, {
 start: [0],
 //cssPrefix: 'noUiX-',
 connect: true,
 step: 1,
 orientation: 'horizontal', // 'horizontal' or 'vertical'
 range: {
   'min': 0,
   'max': 24
 },
 format: wNumb({
   decimals: 0
 })
});

var minutes_slider = document.getElementById('license-minutes-slider');
noUiSlider.create(minutes_slider, {
 start: [0],
 //cssPrefix: 'noUiX-',
 connect: true,
 step: 1,
 orientation: 'horizontal', // 'horizontal' or 'vertical'
 range: {
   'min': 0,
   'max': 60
 },
 format: wNumb({
   decimals: 0
 })
});

minutes_slider.noUiSlider.on('set.one', function () {
  //alert(this.get());
  g_license_time.minutes = this.get();
  update_license_time();
});

hours_slider.noUiSlider.on('set.one', function () {
  //alert(this.get());
  g_license_time.hours = this.get();
  update_license_time();
});

days_slider.noUiSlider.on('set.one', function () {
  //alert(this.get());
  g_license_time.days = this.get();
  update_license_time();
});

months_slider.noUiSlider.on('set.one', function () {
  //alert(this.get());
  g_license_time.months = this.get();
  update_license_time();
});

years_slider.noUiSlider.on('set.one', function () {
  //alert(this.get());
  g_license_time.years = this.get();
  update_license_time();
});

  $('#create_license-applist').chips({
        autocompleteOptions: {
          data: {
            //'Apple':null
          },
          limit: Infinity,
          minLength: 1
        }
      });
}

function create_license()
{
  var max_devices = document.getElementById("license_max_devices-slider").noUiSlider.get();
  var max_sessions = document.getElementById("license_max_sessions-slider").noUiSlider.get();
  var max_activations = document.getElementById("license_max_activations-slider").noUiSlider.get();
  var copies = document.getElementById("license_num_copies-slider").noUiSlider.get();

  var applist = M.Chips.getInstance(document.getElementById("create_license-applist")).chipsData;
  var tied_apps = [];
  for (i = 0; i < applist.length; i++)
  tied_apps.push(applist[i].tag);

  expiration = BigInt(0);

  switch (parseInt($("input[name='group1']:checked").val())){
    case 1:
    {
      //no expiration
      expiration = BigInt(0);
    }
    break;
    case 2:
    {
      //from date and time
      var datepicker1 = M.Datepicker.getInstance(document.getElementById("datepicker1"));
      if (datepicker1.toString().length == 0){
        alert('Please select date');
        return;
      }
      var timepicker1 = M.Timepicker.getInstance(document.getElementById("timepicker1"));
      if (typeof(timepicker1.time) === "undefined"){
        alert('Please select time');
        return;
      }
      var expires = new Date(datepicker1.toString() + " " + timepicker1.time);
      expiration = BigInt(Math.abs(expires - Date.now()));
      if (expiration <= 0){
        alert('Please select valid date & time');
        return;
      }
    }
    break;
    case 3:
    {
      var time = 0;
      time += parseInt(g_license_time.minutes) * MILLISEC._MINUTE;
      time += parseInt(g_license_time.hours) * MILLISEC._HOUR;
      time += parseInt(g_license_time.days) * MILLISEC._DAY;
      time += parseInt(g_license_time.months) * MILLISEC._MONTH;
      time += parseInt(g_license_time.years) * MILLISEC._YEAR;
      expiration = BigInt(time);
      if (expiration <= 0){
        alert('Please select valid time');
        return;
      }
    }
    break;
  }

  server_create_license([parseInt(max_devices), parseInt(max_sessions), parseInt(max_activations), parseInt(copies)], tied_apps, expiration.toString());
  var inst = M.Modal.getInstance(document.getElementById("create_license_modal"));
  inst.close();
}

function setup_create_license_modal()
{
    //server_query_applist_();
    //decided to go with the way below instead of querying the applist from the server.
    var myapps = {};
    var elems = $("#applist").children();
    for (i = 0; i < elems.length; i++){
      if (elems[i].children.length){
        myapps[elems[i].children[1].innerText] = null;
      }
    }

    $('#create_license-applist').chips({
          autocompleteOptions: {
            data: myapps,//data: {'Apple':null},
            limit: Infinity,
            minLength: 1
          }
        });
}

function onloaded_setup_licenses_searchbar()
{
  var instance = M.Chips.getInstance(document.getElementById('license_search'));
  //search_users = function(){}; //for debugging

  instance.options.onChipAdd = function(){
    search_licenses();
  };

  instance.options.onChipDelete = function(){
    if (licenses_block_search_deletion)
          return;
    search_licenses();
  };
}

///////////////////////////////////////////////////////////////////////////
//devices

function devices_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr("device-page_".length));
  current_devices_pg = page_num;
  devices_navigate(page_num, srch_devices);
}

function search_devices()
{
  alert(1);
  search_tags = app.get_tags("device_search");
  current_device_pg = 1;
  if (search_tags.length == 0){
      srch_devices = null;
      devices_navigate(1, srch_devices);
  }else{
    alert(2);
  devices_navigate(1, srch_devices = JSON.stringify(search_tags));
  }
}

function query_devices_list()
{
  devices_navigate(current_licenses_pg, srch_devices);
}

function on_device_info(json_str)
{
  var obj = JSON.parse(json_str);
  var html = '';
  for (const prop in obj) {
      html += '<tr>';
      html += '<td>' + escape_html(prop) + '</td>';
      html += '<td>' + escape_html(obj[prop]) + '</td>';
      html += '</tr>';
  }
  $("#md-deviceinfo").html(html);
}

function manage_device(obj)
{
  g_device_id = obj.parentNode.parentNode.id.substr("device-".length);
  g_device_uuid = get_element_by_index(obj.parentNode.parentNode.childNodes, 1).innerText;
  $("#device_id-1").text(g_device_uuid); //+ '<i class="material-icons right">close</i>'
  $("#md-deviceinfo").html("");
  M.Modal.getInstance(document.getElementById("manage_device_modal")).open();
  server_query_device_info(g_device_id);
}

function on_devices(json_str)
{
  $("#devicelist").html("");
  var j = JSON.parse(json_str);
  if (j.length == 0)
    return;
    var current_page = j[0]["current_page"];
    var pages = j[0]["pages"];
    var start_page, end_page;
    if (current_page <= 3){
        //1,2,3,4,5
        start_page = 1;
        end_page = 5;
    }else{
      //2,3,4,5,6
      var end_page = current_page + 2;
      var start_page = current_page - 2;//4-3=2
      if (end_page > pages){
          end_page = pages < 5 ? 5 : pages;
          start_page = (pages > 5) ? (pages - 5) : 1;
        }
    }

    {
      var html = '';
      var page_back_disabled = start_page == current_page;
      var page_forward_disabled = end_page == current_page;
      html += '<li class="';
      if (page_back_disabled)
            html += "disabled";
      html += '"><a href="#" ';
      if (!page_back_disabled)
            html += ' id="device-page_' + (current_page - 1) + '" onclick=devices_navigate_page(this)';
      html += '><i class="material-icons">chevron_left</i></a></li>';
      for (var i = start_page; i <= end_page; i++){
            var classdata = '';
            if (i == current_page)
              classdata += 'active';
              if (i > pages)
              classdata += ' disabled';
            targetinfo = ' id="device-page_' + i + '"';
            html += '<li class="' + classdata +'"><a href="#" ' + targetinfo + ' onclick=devices_navigate_page(this)>' + i + '</a></li>';
      }
      html += '<li class="waves-effect disabled"><a href="#"><i class="material-icons">chevron_right</i></a></li>';
      $("#device_pages").html(html);
    }


  for (var i = 1; i < j.length; i++){
    var html = "<tr id=\"device-" + escape_html(j[i].id) + "\">";
    //html += '<td><p><label><input type="checkbox" /><span></span></label></p></td>';
    html += "<td>" + j[i].id + "</td>"; //id is 100% server-sided, no need to escape html
    html += "<td>" + j[i].uuid + "</td>";
    html += "<td id='device-usr-" + escape_html(j[i].user_id) + "'>" + j[i].user + "</td>";
    html += "<td>" + j[i].device_type + "</td>";
    html += "<td>" + j[i].reg_ip + "</td>";
    html += "<td>" + j[i].current_ip + "</td>"; //last login ip

    html += "<td>" + new Date(j[i].last_login).toLocaleString() +"</td>";
    html += "<td>" + new Date(j[i].created).toLocaleString() +"</td>";
    html += '<td><a class="btn waves-effect waves-light activator" href="#" onclick=manage_device(this)>Manage</a></td>';
    html += "</tr>";
    $("#devicelist").append(html);
  }
}

function delete_search_results_devices()
{
  var instance = M.Chips.getInstance(document.getElementById('device_search'));
  devices_block_search_deletion = true;
  for (n = instance.chipsData.length - 1; n > -1; n--)
      instance.deleteChip(n);
  devices_block_search_deletion = false;
}

function onloaded_setup_devices_etc()
{
  var instance = M.Chips.getInstance(document.getElementById('device_search'));
  //search_users = function(){}; //for debugging

  instance.options.onChipAdd = function(){
    search_devices();
  };

  instance.options.onChipDelete = function(){
    if (devices_block_search_deletion)
          return;
    search_devices();
  };
}

////////////////////////////////////////////////////////////////////////////////////////
//debug logs

function debuglogs_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr("debuglog-page_".length));
  current_debuglog_pg = page_num;
  debuglogs_navigate(page_num, srch_debuglogs);
}

function search_debuglogs()
{
  var search_tags = app.get_tags("debuglog_search");
  current_debuglog_pg = 1;
  if (search_tags.length == 0){
      srch_debuglogs = null;
      debuglogs_navigate(1, srch_debuglogs);
  }else{
  srch_debuglogs = JSON.stringify(search_tags);
  debuglogs_navigate(1, srch_debuglogs);
  }
}

function query_debuglogs()
{
  debuglogs_navigate(current_debuglog_pg, srch_debuglogs);
}

function on_debuglogs(json_str)
{
  $("#debuglogs").html("");
  var j = JSON.parse(json_str);
  if (j.length == 0)
    return;
    var current_page = j[0]["current_page"];
    var pages = j[0]["pages"];
    var start_page, end_page;
    if (current_page <= 3){
        //1,2,3,4,5
        start_page = 1;
        end_page = 5;
    }else{
      //2,3,4,5,6
      var end_page = current_page + 2;
      var start_page = current_page - 2;//4-3=2
      if (end_page > pages){
          end_page = pages < 5 ? 5 : pages;
          start_page = (pages > 5) ? (pages - 5) : 1;
        }
    }

    {
      var html = '';
      var page_back_disabled = start_page == current_page;
      var page_forward_disabled = end_page == current_page;
      html += '<li class="';
      if (page_back_disabled)
            html += "disabled";
      html += '"><a href="#" ';
      if (!page_back_disabled)
            html += ' id="debuglog-page_' + (current_page - 1) + '" onclick=debuglogs_navigate_page(this)';
      html += '><i class="material-icons">chevron_left</i></a></li>';
      for (var i = start_page; i <= end_page; i++){
            var classdata = '';
            if (i == current_page)
              classdata += 'active';
              if (i > pages)
              classdata += ' disabled';
            targetinfo = ' id="debuglog-page_' + i + '"';
            html += '<li class="' + classdata +'"><a href="#" ' + targetinfo + ' onclick=debuglogs_navigate_page(this)>' + i + '</a></li>';
      }
      html += '<li class="waves-effect disabled"><a href="#"><i class="material-icons">chevron_right</i></a></li>';
      $("#debuglog_pages").html(html);
    }


  for (var i = 1; i < j.length; i++){
    var html = "<tr id=\"debuglog-" + escape_html(j[i].id) + "\">";
    //html += '<td><p><label><input type="checkbox" /><span></span></label></p></td>';

    html += "<td>" + j[i].message + "</td>"; //no need to escape anymore, server automatically escapes every new message. //html += "<td>" + escape_html(j[i].message) + "</td>";

    html += "<td>" + j[i].ip + "</td>";
    html += "<td>" + escape_html(j[i].uid) + "</td>";
    html += "<td>" + escape_html(j[i].app_id) + "</td>";
    if (j[i].hasOwnProperty("log_identify"))
    html += "<td>" + j[i].log_identify + "</td>";
    else {
      html += "<td>N/A</td>";
    }
    html += "<td>" + new Date(j[i].time).toLocaleString() +"</td>";
    switch (j[i].log_type){
      case store_debug_types.info:
      html += "<td>Info</td>";
      break;
      case store_debug_types.security:
      html += "<td>Security</td>";
      break;
      case store_debug_types.warning:
      html += "<td>Warning</td>";
      break;
      case store_debug_types.error:
      html += "<td>Error</td>";
      break;
    }

    switch (j[i].priv_lvl){
      case store_debug_priv_lvls.none:
      html += "<td>Anyone</td>";
      break;
      case store_debug_priv_lvls.user:
      html += "<td>User</td>";
      break;
      case store_debug_priv_lvls.admin:
      html += "<td>Admin</td>";
      break;
      case store_debug_priv_lvls.system:
      html += "<td>Super Admin</td>";
      break;
    }

    html += "</tr>";
    $("#debuglogs").append(html);
  }
}

function delete_search_results_debuglogs()
{
  var instance = M.Chips.getInstance(document.getElementById('debuglog_search'));
  debuglog_block_search_deletion = true;
  for (n = instance.chipsData.length - 1; n > -1; n--)
      instance.deleteChip(n);
  debuglog_block_search_deletion = false;
}

function onloaded_setup_debuglogs_etc()
{
  var instance = M.Chips.getInstance(document.getElementById('debuglog_search'));
  //search_users = function(){}; //for debugging

  instance.options.onChipAdd = function(){
    search_debuglogs();
  };

  instance.options.onChipDelete = function(){
    if (debuglog_block_search_deletion)
          return;
    search_debuglogs();
  };

  function isNumber(n) {
   return !isNaN(parseFloat(n)) && isFinite(n);
}

  $('#debuglog_pagenum').keyup(function (e) {
  if (e.which === 13 && isNumber(e.target.value)) {
     //alert("Event " + e.target.value);
     current_debuglog_pg = parseInt(e.target.value);
     debuglogs_navigate(current_debuglog_pg, srch_debuglogs);
  }
  });

}

////////////////////////////////////////////////////////////////////////////////////////
//login logs

function loginlogs_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr("loginlog-page_".length));
  current_loginlog_pg = page_num;
  loginlogs_navigate(page_num, srch_loginlogs);
}

function search_loginlogs()
{
  var search_tags = app.get_tags("loginlog_search");
  current_loginlog_pg = 1;
  if (search_tags.length == 0){
      srch_loginlogs = null;
      loginlogs_navigate(1, srch_loginlogs);
  }else{
  srch_loginlogs = JSON.stringify(search_tags);
  loginlogs_navigate(1, srch_loginlogs);
  }
}

function query_loginlogs()
{
  loginlogs_navigate(current_loginlog_pg, srch_loginlogs);
}

function on_loginlogs(json_str)
{
  $("#loginlogs").html("");
  var j = JSON.parse(json_str);
  if (j.length == 0)
    return;
    var current_page = j[0]["current_page"];
    var pages = j[0]["pages"];
    var start_page, end_page;
    if (current_page <= 3){
        //1,2,3,4,5
        start_page = 1;
        end_page = 5;
    }else{
      //2,3,4,5,6
      var end_page = current_page + 2;
      var start_page = current_page - 2;//4-3=2
      if (end_page > pages){
          end_page = pages < 5 ? 5 : pages;
          start_page = (pages > 5) ? (pages - 5) : 1;
        }
    }

    {
      var html = '';
      var page_back_disabled = start_page == current_page;
      var page_forward_disabled = end_page == current_page;
      html += '<li class="';
      if (page_back_disabled)
            html += "disabled";
      html += '"><a href="#" ';
      if (!page_back_disabled)
            html += ' id="loginlog-page_' + (current_page - 1) + '" onclick=loginlogs_navigate_page(this)';
      html += '><i class="material-icons">chevron_left</i></a></li>';
      for (var i = start_page; i <= end_page; i++){
            var classdata = '';
            if (i == current_page)
              classdata += 'active';
              if (i > pages)
              classdata += ' disabled';
            targetinfo = ' id="loginlog-page_' + i + '"';
            html += '<li class="' + classdata +'"><a href="#" ' + targetinfo + ' onclick=loginlogs_navigate_page(this)>' + i + '</a></li>';
      }
      html += '<li class="waves-effect disabled"><a href="#"><i class="material-icons">chevron_right</i></a></li>';
      $("#loginlog_pages").html(html);
    }


  for (var i = 1; i < j.length; i++){
    var html = "<tr id=\"loginlog-" + escape_html(j[i].id) + "\">";
    //html += '<td><p><label><input type="checkbox" /><span></span></label></p></td>';

    html += "<td>" + j[i].ip + "</td>";
    html += "<td>" + escape_html(j[i].uid) + "</td>";
    html += "<td>" + escape_html(j[i].app_id) + "</td>";
    html += "<td>" + new Date(j[i].time).toLocaleString() +"</td>";
    switch (j[i].login_type){
      case login_types.main_login_windows_x86_x64:
      html += "<td>Windows (x64)</td>";
      break;
    }

    switch (j[i].result){
      case login_result_t.ok:
      html += "<td class='green-text'>OK</td>";
      break;
      case login_result_t.user_does_not_exist:
      html += "<td class='red-text'>Nonexistent user</td>";
      break;
      case login_result_t.incorrect_password:
      html += "<td class='red-text'>Incorrect password</td>";
      break;
      case login_result_t.banned:
      html += "<td class='red-text'>Banned</td>";
      break;
      case login_result_t.device_registration_failed:
      html += "<td class='red-text'>Device Registration Failed</td>";
      break;
      case login_result_t.hwid_mismatch:
      html += "<td class='red-text'>HWID Mismatch</td>";
      break;
    }

    html += "</tr>";
    $("#loginlogs").append(html);
  }
}

function delete_search_results_loginlogs()
{
  var instance = M.Chips.getInstance(document.getElementById('loginlog_search'));
  loginlog_block_search_deletion = true;
  for (n = instance.chipsData.length - 1; n > -1; n--)
      instance.deleteChip(n);
  loginlog_block_search_deletion = false;
}

function onloaded_setup_loginlogs_etc()
{
  var instance = M.Chips.getInstance(document.getElementById('loginlog_search'));
  //search_users = function(){}; //for debugging

  instance.options.onChipAdd = function(){
    search_loginlogs();
  };

  instance.options.onChipDelete = function(){
    if (loginlog_block_search_deletion)
          return;
    search_loginlogs();
  };

  function isNumber(n) {
   return !isNaN(parseFloat(n)) && isFinite(n);
}

  $('#loginlog_pagenum').keyup(function (e) {
  if (e.which === 13 && isNumber(e.target.value)) {
     //alert("Event " + e.target.value);
     current_loginlog_pg = parseInt(e.target.value);
     loginlogs_navigate(current_loginlog_pg, srch_loginlogs);
  }
  });

}

////////////////////////////////////////////////////////////////////////////////////////
//invite codes

function invites_check_uncheck_all(obj)
{
  var elems = document.getElementById("invitecodes").querySelectorAll("input[type='checkbox']");
  for (i = 0; i < elems.length; i++){
    $(elems[i]).prop( "checked", $(obj).prop("checked"));
  }
}

function on_invites_deleted(jsonstr)
{
  var j = JSON.parse(jsonstr);
  for (var i = 0; i < j.length; i++){
    var id = "invitecode-" + j[i];
    var elem = document.getElementById(id);
    if (elem !== null)
      elem.parentNode.removeChild(elem);
  }
}

function on_all_invites_deleted()
{
  $("#invitecodes").html("");
}

function mass_delete_invites()
{
  server_delete_invites(manage_invites);
}

function begin_all_invites_deletion()
{
    delete_invites_start = Date.now();
    //M.toast({html:"mouse down."});
}

function end_all_invites_deletion()
{
  if (typeof(delete_invites_start) === "undefined")
        return;
  const elapsedms = Date.now() - delete_invites_start;
  const elapsedsec = elapsedms / 1000; //Math.floor
  if (elapsedsec >= 2.5){
    M.toast({html:"Deleting all invites."});
    server_delete_all_invites();
  }
  else {
    alert(elapsedsec);
    M.toast({html:"please hold down the button for at least 2.5 seconds to confirm."});
  }

}

function invites_execute_go()
{
  manage_invites = [];
  var elems = document.getElementById("invitecodes").querySelectorAll("input[type='checkbox']:checked");
  for (i = 0; i < elems.length; i++){
    var id = elems[i].parentNode.parentNode.parentNode.parentNode.id;
    manage_invites.push(id.substr("invitecode-".length));
  }
  /*
  //was planning on using this instead
  var children = $("#licenselist").children();
  for (i = 0; i < children.length; i++){
  var child = children[i];
  child.cells[0].childNodes[0]
  }
  */

  switch (parseInt($("#invites_go_select").val())){
    case 1:
    mass_delete_invites();
    break;
  }
}


function invitecodes_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr("invitecodes-page_".length));
  current_invites_pg = page_num;
  invitecodes_navigate(page_num, srch_invites);
}

function search_invites()
{
  var search_tags = app.get_tags("invitecodes_search");
  current_invites_pg = 1;
  if (search_tags.length == 0){
      srch_invites = null;
      invitecodes_navigate(1, null);
  }else{
  srch_invites = JSON.stringify(search_tags);
  invitecodes_navigate(1, srch_invites);
  }
}

function query_invites()
{
  invitecodes_navigate(current_invites_pg, srch_invites);
}

function on_invites_generated(s)
{
    $("#generated_invites").val(s);
    M.textareaAutoResize($('#generated_invites'));
    var mdl = M.Modal.getInstance(document.getElementById('modal_invites_generated'));
    mdl.open();
    query_invites();
}

function on_invites(json_str)
{
  $("#invitecodes").html("");
  var j = JSON.parse(json_str);
  if (j.length == 0)
    return;
    var current_page = j[0]["current_page"];
    var pages = j[0]["pages"];
    var start_page, end_page;
    if (current_page <= 3){
        //1,2,3,4,5
        start_page = 1;
        end_page = 5;
    }else{
      //2,3,4,5,6
      var end_page = current_page + 2;
      var start_page = current_page - 2;//4-3=2
      if (end_page > pages){
          end_page = pages < 5 ? 5 : pages;
          start_page = (pages > 5) ? (pages - 5) : 1;
        }
    }

    {
      var html = '';
      var page_back_disabled = start_page == current_page;
      var page_forward_disabled = end_page == current_page;
      html += '<li class="';
      if (page_back_disabled)
            html += "disabled";
      html += '"><a href="#" ';
      if (!page_back_disabled)
            html += ' id="invitecodes-page_' + (current_page - 1) + '" onclick=invitecodes_navigate_page(this)';
      html += '><i class="material-icons">chevron_left</i></a></li>';
      for (var i = start_page; i <= end_page; i++){
            var classdata = '';
            if (i == current_page)
              classdata += 'active';
              if (i > pages)
              classdata += ' disabled';
            targetinfo = ' id="invitecodes-page_' + i + '"';
            html += '<li class="' + classdata +'"><a href="#" ' + targetinfo + ' onclick=invitecodes_navigate_page(this)>' + i + '</a></li>';
      }
      html += '<li class="waves-effect disabled"><a href="#"><i class="material-icons">chevron_right</i></a></li>';
      $("#invitecodes_pages").html(html);
    }

  var html = "";

  for (var i = 1; i < j.length; i++){
    html += "<tr id=\"invitecode-" + escape_html(j[i].id) + "\">";
    html += '<td><p><label><input type="checkbox" /><span></span></label></p></td>';
    html += "<td>" + j[i].code + "</td>";
    html += "<td>" + j[i].uses + "/" + j[i].max_uses + "</td>";
    html += "<td>" + new Date(j[i].created).toLocaleString() +"</td>";
    if (j[i].last_use != 0)
      html += "<td>" + new Date(j[i].last_use).toLocaleString() +"</td>";
      else
      html += "<td>N/A</td>";

    html += "<td>";
    if (typeof(j[i].users) !== "undefined" && j[i].users !== null){
      for (n = 0; n < j[i].users.length; n++){
          html += '<div class="chip">' + escape_html(j[i].users[n]) + '</div>';
      }
    }
    else html += "N/A";
    html += "</td>";

    html += "</tr>";
  }
  $("#invitecodes").append(html);
}


function onloaded_setup_invites_etc()
{
  var instance = M.Chips.getInstance(document.getElementById('invitecodes_search'));

  instance.options.onChipAdd = function(){
    search_invites();
  };

  instance.options.onChipDelete = function(){
    search_invites();
  };

  var slider = document.getElementById('max-uses-slider');
  noUiSlider.create(slider, {
   start: [1],
   connect: true,
   //cssPrefix: 'noUiX-',
   step: 1,
   orientation: 'horizontal', // 'horizontal' or 'vertical'
   range: {
     'min': 0,
     'max': 100
   },
   format: wNumb({
     decimals: 0
   })
  });

  var slider2 = document.getElementById('invitecode-copies-slider');
  noUiSlider.create(slider2, {
   start: [1],
   connect: true,
   //cssPrefix: 'noUiX-',
   step: 1,
   orientation: 'horizontal', // 'horizontal' or 'vertical'
   range: {
     'min': 1,
     'max': 100
   },
   format: wNumb({
     decimals: 0
   })
  });

}

function create_invites()
{
  var slider = document.getElementById('max-uses-slider');
  var max_uses = parseInt(slider.noUiSlider.get());
  slider = document.getElementById('invitecode-copies-slider');
  var num_copies = parseInt(slider.noUiSlider.get());
  server_create_invites(max_uses, num_copies);
}

////////////////////////////////////////////////////////////////////////////////////////
//sessions

function sessions_check_uncheck_all(obj)
{
  var elems = document.getElementById("sessionslist").querySelectorAll("input[type='checkbox']");
  for (i = 0; i < elems.length; i++){
    $(elems[i]).prop( "checked", $(obj).prop("checked"));
  }
}


function mass_delete_sessions()
{
  server_delete_sessions(manage_sessions);
}

function begin_all_sessions_deletion(e)
{
  //alert(e.button); //native
  delete_start = undefined;
  if (e.which != 1)
      return;
    delete_start = Date.now();
    //M.toast({html:"mouse down."});
}

function end_all_sessions_deletion()
{
  if (typeof(delete_start) === "undefined")
        return;
  const elapsedms = Date.now() - delete_start;
  const elapsedsec = elapsedms / 1000; //Math.floor
  if (elapsedsec >= 2.5){
    M.toast({html:"Killing all Sessions."});
    server_kill_all_sessions();
  }
  else {
    //alert(elapsedsec);
    M.toast({html:"please hold down the button for at least 2.5 seconds to confirm."});
  }

}


function sessions_execute_go()
{
  manage_sessions = [];
  var elems = document.getElementById("sessionslist").querySelectorAll("input[type='checkbox']:checked");
  for (i = 0; i < elems.length; i++){
    var id = elems[i].parentNode.parentNode.parentNode.parentNode.id;
    manage_sessions.push(id.substr("session-".length));
  }

  switch (parseInt($("#sessions_go_select").val())){
    case 1:
    mass_delete_sessions();
    break;
  }
}


function sessions_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr("sessions-page_".length));
  current_sessions_pg = page_num;
  sessions_navigate(page_num, srch_sessions);
}

function search_sessions()
{
  var search_tags = app.get_tags("sessions_search");
  current_sessions_pg = 1;
  if (search_tags.length == 0){
      srch_sessions = null;
      sessions_navigate(1, null);
  }else{
  srch_sessions = JSON.stringify(search_tags);
  sessions_navigate(1, srch_sessions);
  }
}

function query_sessions()
{
  sessions_navigate(current_sessions_pg, srch_sessions);
}

function on_sessions(json_str)
{
  $("#sessionslist").html("");
  var j = JSON.parse(json_str);
  if (j.length == 0)
    return;
    var current_page = j[0]["current_page"];
    var pages = j[0]["pages"];
    var start_page, end_page;
    if (current_page <= 3){
        //1,2,3,4,5
        start_page = 1;
        end_page = 5;
    }else{
      //2,3,4,5,6
      var end_page = current_page + 2;
      var start_page = current_page - 2;//4-3=2
      if (end_page > pages){
          end_page = pages < 5 ? 5 : pages;
          start_page = (pages > 5) ? (pages - 5) : 1;
        }
    }

    {
      var html = '';
      var page_back_disabled = start_page == current_page;
      var page_forward_disabled = end_page == current_page;
      html += '<li class="';
      if (page_back_disabled)
            html += "disabled";
      html += '"><a href="#" ';
      if (!page_back_disabled)
            html += ' id="sessions-page_' + (current_page - 1) + '" onclick=sessions_navigate_page(this)';
      html += '><i class="material-icons">chevron_left</i></a></li>';
      for (var i = start_page; i <= end_page; i++){
            var classdata = '';
            if (i == current_page)
              classdata += 'active';
              if (i > pages)
              classdata += ' disabled';
            targetinfo = ' id="sessions-page_' + i + '"';
            html += '<li class="' + classdata +'"><a href="#" ' + targetinfo + ' onclick=sessions_navigate_page(this)>' + i + '</a></li>';
      }
      html += '<li class="waves-effect disabled"><a href="#"><i class="material-icons">chevron_right</i></a></li>';
      $("#sessions_pages").html(html);
    }

  var html = "";

  for (var i = 1; i < j.length; i++){
    html += "<tr id=\"session-" + escape_html(j[i].id) + "\">";
    html += '<td><p><label><input type="checkbox" /><span></span></label></p></td>';
    html += "<td>" + j[i].id + "</td>";
    html += "<td>" + j[i].ip + "</td>";
    html += "<td>" + j[i].uid + "</td>";
    html += "<td>" + j[i].aid + "</td>";
    html += "<td>" + j[i].did + "</td>";
    html += "<td>" + j[i].lid + "</td>";
    html += "<td>" + new Date(j[i].created).toLocaleString() +"</td>";
    html += "<td>" + new Date(j[i].last_active).toLocaleString() +"</td>";
    html += "<td>" + j[i].type +"</td>";
    html += "<td>" + j[i].server_id +"</td>";
    html += "</tr>";
  }
  $("#sessionslist").append(html);
}


function onloaded_setup_sessions_etc()
{
  var instance = M.Chips.getInstance(document.getElementById('sessions_search'));

  instance.options.onChipAdd = function(){
    search_sessions();
  };

  instance.options.onChipDelete = function(){
    search_sessions();
  };

  function isNumber(n) {
   return !isNaN(parseFloat(n)) && isFinite(n);
}

  $('#sessions_pagenum').keyup(function (e) {
  if (e.which === 13 && isNumber(e.target.value)) {
     //alert("Event " + e.target.value);
     current_sessions_pg = parseInt(e.target.value);
     sessions_navigate(current_sessions_pg, srch_sessions);
  }
  });

  $('#sessionkillallbtn').mousedown(begin_all_sessions_deletion);
  $('#sessionkillallbtn').mouseup(end_all_sessions_deletion);

}

////////////////////////////////////////////////////////////////////////////////////////

function userbans_check_uncheck_all(obj)
{
  var elems = document.getElementById("userbanlist").querySelectorAll("input[type='checkbox']");
  for (i = 0; i < elems.length; i++){
    $(elems[i]).prop( "checked", $(obj).prop("checked"));
  }
}

function devicebans_check_uncheck_all(obj)
{
  var elems = document.getElementById("devicebanslist").querySelectorAll("input[type='checkbox']");
  for (i = 0; i < elems.length; i++){
    $(elems[i]).prop( "checked", $(obj).prop("checked"));
  }
}

function mass_unban_devices()
{
  if (selected_banned_devices == 0)
  return;
  server_unban_devices(selected_banned_devices);
}

function on_unbanned_devices(j)
{

}

function devicebans_execute_go()
{
  selected_banned_devices = [];
  var elems = document.getElementById("devicebanslist").querySelectorAll("input[type='checkbox']:checked");
  for (i = 0; i < elems.length; i++){
    var id = elems[i].parentNode.parentNode.parentNode.parentNode.id;
    selected_banned_devices.push(id.substr("deviceban-".length));
  }
  switch (parseInt($("#devicebans_go_select").val())){
    case 1:
    mass_unban_devices();
    break;
    break;
  }
}

function mass_unban_users()
{
  if (selected_banned_users.length == 0)
  return;
  server_unban_users(selected_banned_users);
}

function on_unbanned_users(j)
{
  for (i = 0; i < j.length; i++){
    var elem = document.getElementById("userban-" + j[i]);
    if (elem === null)
        continue;
    elem.parentNode.removeChild(elem);
  }
}

function user_bans_execute_go()
{
  selected_banned_users = [];
  var elems = document.getElementById("userbanlist").querySelectorAll("input[type='checkbox']:checked");
  for (i = 0; i < elems.length; i++){
    var id = elems[i].parentNode.parentNode.parentNode.parentNode.id;
    selected_banned_users.push(id.substr("userban-".length));
  }
  switch (parseInt($("#userbans_go_select").val())){
    case 1:
    mass_unban_users();
    break;
    break;
  }
}

function devicebans_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr(devicebans_page_prefix_name + "-page_".length));
  current_devicebans_pg = page_num;
  devicebans_navigate(page_num, srch_bans_devices);
}

function userbans_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr("userbans-page_".length));
  current_userbans_pg = page_num;
  userbans_navigate(page_num, srch_bans_users);
}

function search_userbans()
{
  var search_tags = app.get_tags("userbans_search");
  current_userbans_pg = 1;
  userbans_navigate(1, search_tags.length ? srch_bans_users = JSON.stringify(search_tags) : null);
}

function search_devicebans()
{
  var search_tags = app.get_tags("devicebans_search");
  current_devicebans_pg = 1;
  devicebans_navigate(1, search_tags.length ? srch_bans_devices = JSON.stringify(search_tags) : null);
}

function query_bans()
{
  userbans_navigate(current_userbans_pg, srch_bans_users);
  devicebans_navigate(current_devicebans_pg, srch_bans_devices);
}


function on_device_bans(json_str)
{
  $("#devicebanslist").html("");
  var j = JSON.parse(json_str);
  if (j.length == 0)
    return;
  process_pages(j[0]["current_page"], j[0]["pages"], devicebans_page_prefix_name, "#devicebans_pages", 'devicebans_navigate_page');

  var html = "";

  for (var i = 1; i < j.length; i++){
    html += "<tr id=\"deviceban-" + escape_html(j[i].id) + "\">";
    html += '<td><p><label><input type="checkbox" /><span></span></label></p></td>';
    html += "<td>" + j[i].did + "</td>";
    html += "<td>" + escape_html(j[i].username) + "(" + j[i].uid + ")" + "</td>";
    html += "<td>" + j[i].reg_ip + "</td>";
    html += "<td>" + j[i]["last_login_ip"] + "</td>";
    html += "<td>" + j[i].device_type +"</td>";
    html += "<td>" + new Date(j[i].registration).toLocaleString() +"</td>";
    html += "<td>" + new Date(j[i].last_login).toLocaleString() +"</td>";
    if (j[i].ban_expiration != 0)
    html += "<td>" + new Date(j[i].ban_expiration).toLocaleString() +"</td>";
else
    html += "<td>Never</td>";
    html += '<td><a class="btn" onclick=manage_banned_device(this)>Manage</a></td>';
    html += "</tr>";
  }
  $("#devicebanslist").append(html);
}


function on_user_bans(json_str)
{
  $("#userbanlist").html("");
  var j = JSON.parse(json_str);
  if (j.length == 0)
    return;
  process_pages(j[0]["current_page"], j[0]["pages"], userbans_page_prefix_name, "#userbans_pages", 'userbans_navigate_page');

  var html = "";

  for (var i = 1; i < j.length; i++){
    html += "<tr id=\"userban-" + escape_html(j[i].id) + "\">";
    html += '<td><p><label><input type="checkbox" /><span></span></label></p></td>';
    html += "<td>" + j[i].uid + "</td>";
    html += "<td>" + j[i].un + "</td>";
    html += "<td>" + j[i].reg_ip + "</td>";
    html += "<td>" + j[i].device_count + "</td>";
    html += "<td>" + new Date(j[i].join_date).toLocaleString() +"</td>";
    html += "<td>" + new Date(j[i].last_login).toLocaleString() +"</td>";
    if (j[i].ban_expiration != 0)
    html += "<td>" + new Date(j[i].ban_expiration).toLocaleString() +"</td>";
else
    html += "<td>Never</td>";
    html += '<td><a class="btn" onclick=manage_banned_user(this)>Manage</a></td>';
    html += "</tr>";
  }
  $("#userbanlist").append(html);
}


function onloaded_setup_bans_etc()
{
  var instance;

  instance = M.Chips.getInstance(document.getElementById('userbans_search'));

  instance.options.onChipAdd = function(){
    search_userbans();
  };

  instance.options.onChipDelete = function(){
    search_userbans();
  };

  instance = M.Chips.getInstance(document.getElementById('devicebans_search'));

  instance.options.onChipAdd = function(){
    search_devicebans();
  };

  instance.options.onChipDelete = function(){
    search_devicebans();
  };

  function isNumber(n) {
   return !isNaN(parseFloat(n)) && isFinite(n);
}

  $('#devicebans_pagenum').keyup(function (e) {
  if (e.which === 13 && isNumber(e.target.value)) {
     //alert("Event " + e.target.value);
     current_devicebans_pg = parseInt(e.target.value);
     devicebans_navigate(current_devicebans_pg, srch_bans_devices);
  }
  });

}

/////////////////////////////////////////////////////////////////////////////////////////
//server-side variables(SSV)

function setup_ssv_modal()
{
    //server_query_applist_();
    //decided to go with the way below instead of querying the applist from the server.
    var myapps = {};
    var elems = $("#applist").children();
    for (i = 0; i < elems.length; i++){
      if (elems[i].children.length){
        myapps[elems[i].children[1].innerText] = null;
      }
    }

    $('#create_ssv-applist').chips({
          autocompleteOptions: {
            data: myapps,//data: {'Apple':null},
            limit: Infinity,
            minLength: 1
          }
        });
}

function create_ssv_variable_type_changed(sel)
{
  $("#ssv-variable_type_str").hide();
  $("#ssv-variable_type_int").hide();
  $("#ssv-variable_type_bin").hide();

  //console.log(sel.selectedIndex);
  $("#ssv-variable_type_" + sel[sel.selectedIndex].value).show();
}

function ssv_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr(pageinfo.indexOf(page_delimiter) + page_delimiter.length));
  current_ssv_pg = page_num;
  ssv_navigate(page_num, srch_ssv);
}

function search_ssv()
{
  var search_tags = app.get_tags("ssv_search");
  current_ssv_pg = 1;
  ssv_navigate(1, search_tags.length ? srch_ssv = JSON.stringify(search_tags) : null);
}

function query_ssv()
{
  $("#ssvlist").html("");
  ssv_navigate(current_ssv_pg, srch_ssv);
}

function onloaded_setup_ssv_etc()
{
  var instance;

  instance = M.Chips.getInstance(document.getElementById('ssv_search'));

  instance.options.onChipAdd = function(){
    search_ssv();
  };

  instance.options.onChipDelete = function(){
    search_ssv();
  };
}

function manage_ssv(o)
{

}

function on_deleted_ssv(json_str)
{
  var j = JSON.parse(json_str);
  for (var i = 0; i < j.length; i++)
      $("#ssv-" + j[i]).remove();
}

function on_created_ssv(json_str)
{
  query_ssv();
}

function on_ssvlist(json_str)
{
  $("#ssvlist").html("");
  var j = JSON.parse(json_str);
  if (j.length == 0)
    return;
  process_pages(j[0]["current_page"], j[0]["pages"], "ssv_", "#ssv_pages", 'ssv_navigate_page');

  var html = "";

  for (var i = 1; i < j.length; i++){
    html += "<tr id=\"ssv-" + escape_html(j[i].id) + "\">";
    html += '<td><p><label><input type="checkbox" /><span></span></label></p></td>';
    html += '<td>' + j[i].id + '</td>';
    html += '<td>' + j[i].name + '</td>';
    html += '<td>' + j[i].type + '</td>';
    html += '<td>' + j[i].value + '</td>';

    html += "<td>";
    if (j[i].tied_apps !== null){
    for (n = 0; n < j[i].tied_apps.length; n++){
        html += '<div class="chip">' + escape_html(j[i].tied_apps[n]) + '</div>';
    }
    }

    html += "</td>";
    html += '<td>' + (j[i].allow_unlicensed_access ? "Yes" : "No") + '</td>';
    html += '<td><a class="btn" onclick=manage_ssv(this)>Modify</a></td>';
    html += "</tr>";
  }
  $("#ssvlist").append(html);
}

function create_ssv()
{
  var allow_unlicensed_access = $("#ssv-allow-unlicensed-access").prop("checked");
  var applist = M.Chips.getInstance(document.getElementById("create_ssv-applist")).chipsData;
  var tied_apps = [];
  for (i = 0; i < applist.length; i++)
  tied_apps.push(applist[i].tag);
  var ssv_name = $("#ssv-name").val();
  var ssv_var_type = document.getElementById("ssv-var-type");
  var ssv_vtype = ssv_var_type[ssv_var_type.selectedIndex].value;
  var ssv_value;
  switch (ssv_vtype){
    case "str":
    ssv_value = $("#ssv-string").val();
    break;
    case "int":
    ssv_value = $("#ssv-int").val();
    break;
    case "bin":
    ssv_value = $("#ssv-bin").val();
    break;
  }
  server_create_ssv(ssv_name, ssv_vtype, ssv_value, tied_apps, allow_unlicensed_access);
}


function ssv_mass_delete(selected)
{
  if (selected.length == 0)
  return;
  server_ssv_delete(selected);
}

function ssv_execute_go()
{
  var selected = [];
  var elems = document.getElementById("ssvlist").querySelectorAll("input[type='checkbox']:checked");
  for (i = 0; i < elems.length; i++){
    var id = elems[i].parentNode.parentNode.parentNode.parentNode.id;
    selected.push(id.substr("ssv-".length));
  }
  switch (parseInt($("#ssv_go_select").val())){
    case 1:
    ssv_mass_delete(selected);
    break;
    break;
  }
}

////////////////////////////////////////////////////////////////////////////////////////

function delete_plugin_apikey(obj)
{
  var plugin_server_id = get_element_by_index(obj.parentNode.parentNode.childNodes, 0).innerText;
  server_delete_plugin_apikey(plugin_server_id);
  obj.parentNode.parentNode.parentNode.removeChild(obj.parentNode.parentNode);
}

function on_received_server_plugins(jstr)
{
  var obj = JSON.parse(jstr);
  var html = '';
  for (var i = 1; i < obj.length; i++){
    html += '<tr>';
    html += '<td>' + escape_html(obj[i].name) + '</td>';
    html += '<td>' + escape_html(obj[i].version) + '</td>';
    html += '<td>0x' + (parseInt(obj[i].id)).toString(16) + '</td>';
    html += '</tr>';
  }
  $("#spl").html(html);
  var modal_inst = M.Modal.getInstance(document.getElementById("modal_server_plugin_list"));
  modal_inst.open();
}

function view_plugins_by_server(obj)
{
  var plugin_server_id = get_element_by_index(obj.parentNode.parentNode.childNodes, 0).innerText;
  var apikey_hash = get_element_by_index(obj.parentNode.parentNode.childNodes, 2).innerText;
  //alert(apikey_hash);
  var apikey = '';
  var apikeys = $("#pluginapikeyslist").children();
  for (var i = 0; i < apikeys.length; i++){
    if (get_element_by_index(apikeys[i].childNodes, 1).innerText == apikey_hash){
      apikey = get_first_element(apikeys[i].childNodes).innerText;
      break;
    }
  }
  if (apikey.length == 0)
  return;
  retrieve_plugin_server_plugins(apikey, plugin_server_id);
}

function on_created_plugin_apikey(jstr)
{
  var j = JSON.parse(jstr);

  var html = '<tr id="plugin-apikey-' + escape_html(j.key) + '">';
  html += '<td>' + j.key + '</td>';
  html += '<td>' + j.id + '</td>';
  html += '<td><a href="#" onclick="delete_plugin_apikey(this)" class="btn right red accent-3 black-text">Delete</a></td>';
  html += '</tr>';

  $("#pluginapikeyslist").append(html);
}


function on_apikeys(jstr)
{
  $("#pluginapikeyslist").html("");
  var html = '';

  var j = JSON.parse(jstr);
  for (var i = 0; i < j.length; i++){
    html += '<tr id="plugin-apikey-' + escape_html(j[i].key) + '">';
    html += '<td>' + j[i].key + '</td>';
    html += '<td>' + j[i].id + '</td>';
html += '<td><a href="#" onclick="delete_plugin_apikey(this)" class="btn right red accent-3 black-text">Delete</a></td>';
    html += '</tr>';
  }
  $("#pluginapikeyslist").html(html);
}

function on_plugins_servers(jstr)
{
  $("#pluginserverlist").html("");
  var html = '';

  var j = JSON.parse(jstr);
  for (var i = 0; i < j.length; i++){
    html += "<tr id=\"plugin-server-" + escape_html(j[i].id) + "\">";
    html += '<td>' + j[i].id + '</td>';
    html += '<td>' + j[i].ip + '</td>';
    html += '<td>' + j[i].apikeyid + '</td>';
    html += '<td>' + j[i].server_id + '</td>'; //note: server id refers to the store server, not the plugin server
    html += '<td><a href="#" onclick="view_plugins_by_server(this)" class="btn black-text">Info</a></td>';
    html += "</tr>";
  }
  $("#pluginserverlist").html(html);
}

function query_plugins()
{
  $("#pluginserverlist").html("");

  server_retrieve_plugins();
}

function setup_plugins_onloaded_etc()
{
  if (!test_mode_enabled){
  $("#pluginapikeyslist").html("");
  $("#pluginserverlist").html("");
}
}

////////////////////////////////////////////////////////////////////////////////////////

function user_view_debuglogs()
{
  var instance = M.Tabs.getInstance(document.getElementById("mysidenav"));
  instance.select('t5');
  var modal_inst = M.Modal.getInstance(document.getElementById("modal3"));
  modal_inst.close();
}


function user_view_loginlogs()
{
  var instance = M.Tabs.getInstance(document.getElementById("mysidenav"));
  instance.select('t6');
  var modal_inst = M.Modal.getInstance(document.getElementById("modal3"));
  modal_inst.close();
}

function user_view_licenses()
{
  var instance = M.Tabs.getInstance(document.getElementById("mysidenav"));
  instance.select('t4');
  var modal_inst = M.Modal.getInstance(document.getElementById("modal3"));
  modal_inst.close();
  delete_search_results_licenses();
  var license_search_chips = M.Chips.getInstance(document.getElementById('license_search'));
  var uid = g_user_id.substr("user-".length);
  var tag1 = '@user_id::' + uid;
  license_search_chips.addChip({
    tag: tag1,
    image: ''
  });
}

function user_view_devices()
{
  M.Modal.getInstance(document.getElementById("modal3")).close();
  M.Tabs.getInstance(document.getElementById("mysidenav")).select('t7');
  delete_search_results_devices();
  var searchbar = M.Chips.getInstance(document.getElementById('device_search'));
  var uid = g_user_id.substr("user-".length);
  var tag1 = '@user_id::' + uid;
  searchbar.addChip({
    tag: tag1,
    image: ''
  });
}
