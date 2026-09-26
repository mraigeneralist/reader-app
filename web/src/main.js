// Entry point for the WebView page. One bundle serves both the visible book
// reader and the hidden import engine; RN picks which handlers it calls.

import { post } from './bridge.js'
import './reader.js'
import './importer.js'

post('page-ready')
