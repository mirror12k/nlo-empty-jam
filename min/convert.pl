#!/usr/bin/env perl
use strict;
use warnings;

use feature 'say';

# use Sugar::IO::File;

use IO::File;
use MIME::Base64;

my $opt_js_optimize_functions = 1;
my $opt_js_minimize = 1;
my $opt_js_lzw_compress = 1;
my $opt_all_lzw_compress = 1;


# my $html = Sugar::IO::File->new(shift // die "html file required")->read;
my $file = shift // die "html file required";
my $html = `cat $file`;
# $html =~ s#(<script\b[^<>]+)src="([^"]+)"([^<>]*>)</script>#"$1$3" . Sugar::IO::File->new($2)->read . "</script>"#gse;



my @js_sources;
my @css_sources;
# my $js = '';
while ($html =~ m#(<script\b[^<>]+)src="([^"]+)"([^<>]*>)</script>#gs) {
	push @js_sources, $2;
	# $js .= `cat $2`;

	# $js .= `./min/optimize_out_functions.pl $2 --compress --mangle`;
	# $js .= `./min/node_modules/uglify-js/bin/uglifyjs $2 --compress --mangle`;
	# say "script: $js";
	warn "inlining js file: $2";
}
while ($html =~ m#(<link\b[^<>]+\bhref="([^"]+\.css)"[^<>]*>)#gs) {
	push @css_sources, $2;
	warn "inlining css file: $2";
}
my $sources = join ' ', @js_sources;
# my $js = `./min/optimize_out_functions.pl $sources | ./min/node_modules/uglify-js/bin/uglifyjs --mangle-props --mangle --compress --toplevel`;

my $js_command =
	($opt_js_optimize_functions ? "./min/optimize_out_functions.pl $sources" : "cat $sources")
	. ($opt_js_minimize ? " | ./min/node_modules/uglify-js/bin/uglifyjs --mangle-props --mangle --compress --toplevel" : "")
	. ($opt_js_lzw_compress ? " | ./min/lzw_compress.js" : "");

my $js = `$js_command`;
# my $js = `./min/optimize_out_functions.pl $sources | ./min/node_modules/uglify-js/bin/uglifyjs --mangle-props --mangle --compress --toplevel | ./min/lzw_compress.js`;
my $js_raw .= `cat $sources`;

my $css_sources = join ' ', @css_sources;
my $css_raw .= $css_sources ? `cat $css_sources` : '';


my $prefix = `cat ./min/lzw_decompress.js | ./min/node_modules/uglify-js/bin/uglifyjs --mangle --compress`;
$js = "$prefix\neval(LZW.decode(`$js`))" if $opt_js_lzw_compress;
$js = "<script>$js</script>";

$html =~ s#(<script\b[^<>]+)src="([^"]+)"([^<>]*>)</script>##gs;
$html =~ s#(<link\b[^<>]+\bhref="([^"]+\.css)"[^<>]*>)##gs;


my $file_inlines = '';
foreach my $arg ($js_raw =~ m#assets/[^'"]+\.png#sg) {
	warn "inlining image file: $arg";
	my $data = `cat $arg`;
	$file_inlines .= "<img style='display:none' data-url='$arg' src='data:image/png;base64," . encode_base64($data, '') . "' />\n";
}
foreach my $arg ($js_raw =~ m#assets/[^'"]+\.wav#sg) {
	warn "inlining audio file: $arg";
	my $data = `cat $arg`;
	$file_inlines .= "<audio style='display:none' data-url='$arg' src='data:audio/wav;base64," . encode_base64($data, '') . "' ></audio>\n";
}
my @font_paths = ($css_raw =~ m#\.\./[^'"]+\.ttf#sg);
foreach my $arg (@font_paths) {
	my $path = $arg =~ s#\.\./#assets/#rs;
	warn "inlining font file: $path";
	my $data = `cat $path`;
	my $encoded_data = "data:audio/wav;base64," . encode_base64($data, '');
	my $q_arg = quotemeta $arg;
	$css_raw =~ s/$q_arg/$encoded_data/s;
	
	# $file_inlines .= "<audio style='display:none' data-url='$arg' src='data:audio/wav;base64," . encode_base64($data, '') . "' ></audio>\n";
}
my $css = $css_sources ? "<style>$css_raw</style>" : '';

if ($opt_all_lzw_compress) {
	IO::File->new("./min/temp.html", 'w')->print("$file_inlines");
	my $compressed_includes = `cat ./min/temp.html | ./min/lzw_compress.js`;
	IO::File->new("./min/temp.html", 'w')->print("$css");
	my $compressed_includes2 = `cat ./min/temp.html | ./min/lzw_compress.js`;
	my $stub = "<script>window.onload=() => document.head.innerHTML+=LZW.decode(`$compressed_includes`)+LZW.decode(`$compressed_includes2`)</script>";
	die "failed to find <head> tag" unless $html =~ s/(<head>)/$1$stub$js/s;
} else {
	die "failed to find <head> tag" unless $html =~ s#(<head>)#$1$js$css$file_inlines#s;
}

# IO::File->new("./min/temp.html", 'w')->print("$file_inlines$css$js");
# my $head = `cat ./min/temp.html | ./min/lzw_compress.js`;
# my $stub = "<script>$prefix\nwindow.onload=() => document.head.innerHTML=LZW.decode(`$head`)</script>";
# die "failed to find <head> tag" unless $html =~ s/(<head>)/$1$stub/s;
# say "$file_inlines$js";

say $html;

