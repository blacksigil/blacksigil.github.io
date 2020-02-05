function on_remember_me(s)
{
  var obj = JSON.parse(s);
  $("#remember_me").prop("checked", obj.remember);
  $("#store").val(obj.store);
  $("#account").val(obj.acc);
  M.updateTextFields();
}
