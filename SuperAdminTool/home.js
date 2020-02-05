var g_plan_id = null;

var subscriptions_block_search_deletion = false;
var current_subscriptions_pg = 1;
var srch_subscriptions = null;

var current_subscriptioncodes_pg = 1;
var srch_subscriptioncodes = null;

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

$(document).ready(function(){
M.AutoInit();
onloaded_setup_subscriptions_searchbar();

});


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



function delete_price_opt(obj)
{
  var price = obj.parentNode.parentNode.childNodes[0].innerText;
  price = price.substr(0, price.length - 1);
  var duration = obj.parentNode.parentNode.childNodes[1].innerText;
  var fnd = false;
  for (var i = 0; i < plan_pricing_options.length; i++){
      if (plan_pricing_options[i].price == price && plan_pricing_options[i].duration == duration){
        fnd = true;
        plan_pricing_options.splice(i, 1);
        break;
      }
  }
  if (fnd)
    obj.parentNode.parentNode.parentNode.removeChild(obj.parentNode.parentNode);
    else {
      alert('not found');
    }
}

function add_pricing_option()
{
  var opt = {};
  opt.price = $("#price1").val();
  opt.duration = $("#plan_duration_slider").val();
  plan_pricing_options.push(opt);
  var h = '<tr>';
  h += '<td>' + opt.price + '$</td>';
  h += '<td>' + opt.duration + '</td>';
  h += '<td><a class="btn red black-text" href="#" onclick=delete_price_opt(this)>Delete</a></td>';
  h += '</tr>';
  $("#pricingoptions1").append(h);
}

function setup_create_plan_modal()
{
  plan_pricing_options = [];
  $("#pricingoptions1").html("");
  $("#createplanbtn").show();
  $("#modifyplanbtn").hide();
  $("#deleteplanbtn").hide();
}

function query_plans()
{
  $("#plans").html('');
  server_query_plans();
}

function show_modify_plan_modal(obj)
{
  g_plan_id = obj.parentNode.parentNode.id;
  g_plan_id = g_plan_id.substr("plan-id-".length);
  $("#createplanbtn").hide();
  $("#modifyplanbtn").show();
  $("#deleteplanbtn").show();
  var m = M.Modal.getInstance(modal1);
  m.open();
}

function delete_plan()
{
  server_delete_plan(g_plan_id);
}

function create_plan()
{
  var obj = {};
  obj.pricing_options = plan_pricing_options;
  obj.name = $("#plan_name").val();
  if (obj.name.length == 0)
        return;
  obj.attributes = {};
  obj.attributes.max_users = parseInt($("#max_users_slider").val());
  obj.attributes.max_sessions = parseInt($("#max_sessions_slider").val());
  obj.attributes.max_licenses = parseInt($("#max_licenses_slider").val());
  obj.attributes.max_apps = parseInt($("#max_apps_slider").val());
  //alert(JSON.stringify(obj));
  server_create_plan(JSON.stringify(obj));
}

function on_plans(json_str)
{
  var o = JSON.parse(json_str);
  if (o == null)
  return;
  var html = "";
  for (var i = 0; i < o.length; i++){
    html += '<tr id="plan-id-' + o[i].id + '">';
    html += '<td>' + escape_html(o[i].id) + '</td>';
    html += '<td>' + escape_html(o[i].name) + '</td>';
    html += '<td>';
    for (const property in o[i]["attributes"])
      html += '<div class="chip">' + escape_html(property) + "=" + escape_html(o[i]["attributes"][property]) + '</div>';
    html += '</td>';
    html += '<td>';
    for (var i2 = 0; i2 < o[i].pricing_options.length; i2++){
      html += '<div class="chip"><b>' + escape_html(o[i].pricing_options[i2].price) + '$</b>&nbsp;' + o[i].pricing_options[i2].duration + ' days</div>';
    }
    html += '</td>';
    html += '<td>' + o[i].active_subs + '</td>';
    html += '<td>' + o[i].total_subs + '</td>';
    html += '<td><a href="#" onclick="show_modify_plan_modal(this)" class="btn waves-effect waves-light green black-text">Modify</a>';
    html += "</tr>";
  }
  $("#plans").html(html);
}
//===============================================================================================
//subscriptions

function query_info_subs()
{
  subscriptions_navigate(current_subscriptions_pg, srch_subscriptions);
  subscriptioncodes_navigate(current_subscriptioncodes_pg, srch_subscriptioncodes);
}

function search_subscriptions()
{
  current_subscriptions_pg = 1;
  var search_tags = app.get_tags('subscriptions_search');
  if (search_tags.length == 0)
      subscriptions_navigate(1, srch_subscriptions = null);
  else
      subscriptions_navigate(1, srch_subscriptions = JSON.stringify(search_tags));
}

function search_subscriptioncodes()
{
  current_subscriptioncodes_pg = 1;
  var search_tags = app.get_tags('subscriptioncodes_search');
  if (search_tags.length == 0)
      subscriptioncodes_navigate(1, srch_subscriptioncodes = null);
  else
      subscriptioncodes_navigate(1, srch_subscriptioncodes = JSON.stringify(search_tags));
}

function onloaded_setup_subscriptions_searchbar()
{
  var instance = M.Chips.getInstance(document.getElementById('subscriptions_search'));

  instance.options.onChipAdd = function(){
    search_subscriptions();
  };

  instance.options.onChipDelete = function(){
    if (subscriptions_block_search_deletion)
          return;
    search_subscriptions();
  };

}

function on_subs_generated(s)
{
  $("#subcodes").val(s);
  M.textareaAutoResize($('#subcodes'));
  var mdl = M.Modal.getInstance(document.getElementById('modal_subcodes_generated'));
  mdl.open();
  $("#subcodes").focus();
  subscriptioncodes_navigate(current_subscriptioncodes_pg, srch_subscriptioncodes);
}

function create_subscription_code()
{
  server_create_subscription_code($("#subplanid").val(),
  parseInt($("#subscription_duration-slider").val()),
  parseInt($("#subscription_copies-slider").val()));
}

function subcodes_navigate_page(obj)
{
  if (obj.parentNode.className.indexOf("disabled") != -1)
        return;
  var pageinfo = obj.id;
  var page_num = parseInt(pageinfo.substr("subcode-page_".length));
  current_subscriptioncodes_pg = page_num;
  subscriptioncodes_navigate(page_num, srch_subscriptioncodes);
}

function on_subscription_codes(json_str)
{
  var j = JSON.parse(json_str);
  if (j.length == 0) return;
  process_pages(j[0]["current_page"], j[0]["pages"], "subcode", "#subscriptioncodes_pages", 'subcodes_navigate_page');

  var html = '';
  for (var i = 1; i < j.length; i++){
    html += '<tr id="subcode-' + j[i].id + '">';
    html += '<td>' + j[i].id + '</td>';
    html += '<td>' + j[i].code + '</td>';
    html += '<td>' + j[i].plan_id + '</td>';
    html += '<td>' + j[i].duration + '</td>';
    html += '<td>' + j[i].subscription_id + '</td>';
    html += '</tr>';
  }
  $("#subscriptioncodes").html(html);
}
