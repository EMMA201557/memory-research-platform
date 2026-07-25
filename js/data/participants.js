/*
 * participants.js
 * -----------------------------------------------------------------------
 * Authorized participants list, kept separate from the application logic.
 *
 * IMPORTANT — why this is a .js file and not a plain .csv file:
 * The app must run by double-clicking index.html (file:// protocol, no
 * web server). Browsers block fetch() of local files under file://, so a
 * real .csv could not be loaded this way. Instead, the list below is a
 * CSV-FORMATTED STRING (same content you'd have in a .csv, one row per
 * line, comma separated) that gets parsed by ordinary JavaScript. You can
 * edit it exactly like a CSV file — just keep the "name,code" format.
 *
 * To add/remove participants, edit the block between the backticks below.
 * Lines starting with # are treated as comments and ignored.
 */

const PARTICIPANTS_CSV = `
name,code
Emma,A014
Liam,A001
Olivia,A002
Noah,A003
Ava,A004
Mateo,A005
Sofia,A006
Lucas,A007
Mia,A008
Ethan,A009
Isabella,A010
Daniel,A011
Grace,A012
Samuel,A013
`;
