export enum TaskType {
  ADD_FAQ = 'Add FAQ',
  UPDATE_SCHEMA = 'Update Schema',
  UPDATE_BLOG = 'Update Blog Content'
}

export const INITIAL_JSON = `{
  "faq": []
}`;

export const INITIAL_PHP_FUNCTIONS = `<?php
// functions.php
function get_data() {
    return json_decode(file_get_contents('data.json'), true);
}
`;

export const INITIAL_PHP_INDEX = `<?php
// index.php
require_once 'functions.php';
$data = get_data();
?>
<!DOCTYPE html>
<html>
<head><title>Page</title></head>
<body>
    <h1>Welcome</h1>
</body>
</html>
`;