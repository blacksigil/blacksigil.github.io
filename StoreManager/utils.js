var installed_overlay_prevent_clickthrough = false;

function _init_app()
{
	init_app();
}

function create_overlay()
{
	if (document.getElementById("overlay") === null){
	//<div class="overlay" style="display: none" id="overlay">
	var elem = document.createElement("div");
	elem.className = "overlay";
	elem.id = "overlay";
	elem.style = "display: none";
	document.body.insertBefore(elem, document.body.firstChild);
	}
	if (!installed_overlay_prevent_clickthrough){
	$('.overlay').click(function (evt) {
	evt.stopPropagation();
	});
		installed_overlay_prevent_clickthrough = true;
	}
}

function toggle_overlay(show)
{
	create_overlay();
		if (!show)
		$("#overlay").css("display", "none")
	else
		$("#overlay").css("display", "");
}
