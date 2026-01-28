package com.huntly.server.controller;

import com.huntly.common.api.ApiResult;
import com.huntly.interfaces.external.model.InterceptTweets;
import com.huntly.interfaces.external.model.TweetId;
import com.huntly.server.connector.twitter.TweetParser;
import com.huntly.server.domain.entity.TweetTrack;
import com.huntly.server.event.EventPublisher;
import com.huntly.server.event.TweetPageCaptureEvent;
import com.huntly.server.service.CapturePageService;
import com.huntly.server.service.GlobalSettingService;
import com.huntly.server.service.TweetTrackService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * @author lcomplete
 */
@Validated
@RestController
@RequestMapping("/api/tweet")
@Slf4j
public class TweetController {

    private final CapturePageService capturePageService;

    private final TweetParser tweetParser;

    private final TweetTrackService tweetTrackService;

    private final EventPublisher eventPublisher;

    private final GlobalSettingService globalSettingService;

    public TweetController(CapturePageService capturePageService, TweetParser tweetParser, TweetTrackService tweetTrackService, EventPublisher eventPublisher, GlobalSettingService globalSettingService) {
        this.capturePageService = capturePageService;
        this.tweetParser = tweetParser;
        this.tweetTrackService = tweetTrackService;
        this.eventPublisher = eventPublisher;
        this.globalSettingService = globalSettingService;
    }

    @PostMapping("/saveTweets")
    public ApiResult<Integer> saveTweets(@RequestBody InterceptTweets tweets) {
        var parsedPages = tweetParser.tweetsToPages(tweets);
        AtomicInteger count = new AtomicInteger();
        // Get minLikes from server-side GlobalSetting instead of extension request
        int minLikes = globalSettingService.getAutoSaveTweetMinLikes();
        parsedPages.forEach(parsedPage -> {
            // SQLite only supports one connection. To avoid other threads from being unable to obtain the SQLite connection, asynchronous events are used
            eventPublisher.publishTweetPageCaptureEvent(new TweetPageCaptureEvent(parsedPage, tweets.getLoginScreenName(), tweets.getBrowserScreenName(), minLikes));
            count.getAndIncrement();
        });
        return ApiResult.ok(count.get());
    }

    @PostMapping(value = "/trackRead")
    public TweetTrack trackRead(@RequestBody TweetId tweetId) {
        return tweetTrackService.trackRead(tweetId.getId());
    }
}
